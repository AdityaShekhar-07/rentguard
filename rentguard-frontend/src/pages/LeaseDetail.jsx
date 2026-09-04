import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Link2,
  Camera,
  RefreshCw,
  MapPin,
  Download,
  CheckCheck,
} from 'lucide-react';

export default function LeaseDetail() {
  const { leaseId } = useParams();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [verification, setVerification] = useState(null);
  const [location, setLocation] = useState('Chennai, India');
  const [area, setArea] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiAssessment, setAiAssessment] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [signingId, setSigningId] = useState(null);
  const [leaseInfo, setLeaseInfo] = useState(null);

  const fetchLogs = async () => {
  try {
    const res = await API.get(`/audit/lease/${leaseId}/logs`);
    setLogs(res.data?.logs || []);
    setLeaseInfo(res.data?.lease || null);
  } catch (err) {
    console.error('Failed to load audit logs:', err);
  }
};

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await API.get(`/audit/lease/${leaseId}/verify`);
      setVerification(res.data || null);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setTimeout(() => setVerifying(false), 300);
    }
  };

  useEffect(() => {
    if (leaseId) {
      fetchLogs();
      handleVerify();
    }
  }, [leaseId]);

  const runAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('area', area);
      formData.append('notes', conditionNotes);
      formData.append('location', location);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await API.post('/ai/assess', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAiAssessment(res.data?.assessment || null);
    } catch (err) {
      console.error('AI Assessment failed:', err);
      alert('Unable to complete AI assessment. Verify backend server and API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data?.url || '';
      }

      await API.post('/audit/log', {
        leaseId,
        area,
        conditionNotes,
        imageUrl,
      });

      setArea('');
      setConditionNotes('');
      setImageFile(null);
      setAiAssessment(null);
      await fetchLogs();
      await handleVerify();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record entry');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOff = async (logId) => {
    setSigningId(logId);
    try {
      await API.patch(`/audit/log/${logId}/sign-off`);
      await fetchLogs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to sign off.');
    } finally {
      setSigningId(null);
    }
  };

  const exportPdfCertificate = () => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 22;

  // Title & Header Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('RentGuard Property Condition Certificate', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Certificate Generated: ${new Date().toUTCString()}`, margin, y);
  y += 10;

  // Property Details Card (Gray Box)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, 170, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('PROPERTY & TENANCY DETAILS', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const propName = leaseInfo?.propertyName || 'Residential Unit';
  const landlordName = leaseInfo?.landlord?.name ? `${leaseInfo.landlord.name} (${leaseInfo.landlord.email})` : 'Registered Landlord';
  const tenantName = leaseInfo?.tenant?.name ? `${leaseInfo.tenant.name} (${leaseInfo.tenant.email})` : 'Unassigned / Prospective Tenant';
  const auditLocation = location || 'Not Specified';

  doc.text(`Property / Flat:  ${propName}`, margin + 6, y + 15);
  doc.text(`Location / City: ${auditLocation}`, margin + 6, y + 21);
  doc.text(`Landlord:          ${landlordName}`, margin + 6, y + 27);
  doc.text(`Tenant:             ${tenantName}`, margin + 6, y + 33);
  y += 44;

  // Chain Verification Status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  if (verification?.isChainValid) {
    doc.setTextColor(16, 124, 65); // emerald
    doc.text('CRYPTOGRAPHIC INTEGRITY: VERIFIED (Sequential SHA-256 Chain Intact)', margin, y);
  } else {
    doc.setTextColor(225, 29, 72); // rose
    doc.text('CRYPTOGRAPHIC INTEGRITY: COMPROMISED / UNVERIFIED', margin, y);
  }
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Lease Reference ID: ${leaseId}`, margin, y);
  y += 6;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, 190, y);
  y += 10;

  // Audit Entries
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Condition Logs & Ledger Blocks', margin, y);
  y += 8;

  logs.forEach((log, index) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Block #${index + 1}: ${log.area}`, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Logged On: ${new Date(log.timestamp).toLocaleString()}`, margin, y);
    y += 5;

    const cleanNotes = log.conditionNotes.replace('[LANDLORD_SIGNED]', '').trim();
    const isSigned = log.conditionNotes.includes('[LANDLORD_SIGNED]');
    doc.text(`Notes: ${cleanNotes}`, margin, y, { maxWidth: 170 });
    y += 7;

    if (isSigned) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 124, 65);
      doc.text('Landlord Sign-Off: Formally Acknowledged', margin, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
    }

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`PREV: ${log.previousHash}`, margin, y);
    y += 4;
    doc.text(`HASH: ${log.currentHash}`, margin, y);
    y += 7;

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, 190, y);
    y += 7;
  });

  const cleanFilename = (leaseInfo?.propertyName || 'Flat').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`RentGuard_${cleanFilename}_Audit_Certificate.pdf`);
};

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
      {/* Integrity Header Card */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Audit Ledger
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-2">Lease Verification Vault</h1>
          <p className="text-xs font-mono text-slate-500 mt-0.5">Lease Reference: {leaseId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {verification === null ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
              Checking status...
            </div>
          ) : verification?.isChainValid ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SECURE (Valid Chain)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Tamper Detected
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 transition active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            Verify
          </button>

          <button
            onClick={exportPdfCertificate}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition active:scale-[0.98] shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF Certificate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-700" /> Record Condition Block
          </h2>

          <form onSubmit={handleCreateLog} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Property Location / City
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chennai, India"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Fixture</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Balcony Sliding Door"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Condition Notes</label>
              <textarea
                required
                rows={3}
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="Describe condition, cracks, or damage..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>

            <button
              type="button"
              disabled={!area || !conditionNotes || aiLoading}
              onClick={runAiAnalysis}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg border border-slate-200 transition active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              {aiLoading ? 'Analyzing Damage...' : 'Run Pre-Audit AI Assessment'}
            </button>

            {aiAssessment && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs animate-fade-in">
                <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-slate-200 pb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      aiAssessment.severity === 'HIGH' || aiAssessment.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    Severity: {aiAssessment.severity || 'UNKNOWN'}
                  </span>
                  <span className="font-mono text-slate-900">{aiAssessment.estimatedCostRange || 'N/A'}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono uppercase">
                  Classification: {aiAssessment.category ? String(aiAssessment.category).replace(/_/g, ' ') : 'GENERAL'}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{aiAssessment.summary}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-lg transition text-xs shadow-sm active:scale-[0.99]"
            >
              {uploading ? 'Hashing into Block...' : 'Lock Record into Ledger'}
            </button>
          </form>
        </div>

        {/* Timeline Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-slate-700" /> Sequential Hash Chain
          </h2>

          {logs.length === 0 ? (
            <div className="p-10 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-400 text-xs">
              No audit blocks recorded for this lease yet. Record the initial move-in condition using the form.
            </div>
          ) : (
            logs.map((log) => {
              const isSigned = log.conditionNotes.includes('[LANDLORD_SIGNED]');
              const displayNotes = log.conditionNotes.replace('[LANDLORD_SIGNED]', '').trim();

              return (
                <div
                  key={log.id}
                  className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3 hover:border-slate-300 transition duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{log.area}</span>
                      {isSigned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCheck className="w-3 h-3 text-emerald-600" /> Acknowledged
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{displayNotes}</p>

                  {log.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={log.imageUrl}
                        alt={log.area}
                        className="w-full max-h-60 object-cover rounded-xl border border-slate-100"
                      />
                    </div>
                  )}

                  {/* Landlord Sign-Off Action */}
                  {user?.role === 'LANDLORD' && !isSigned && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleSignOff(log.id)}
                        disabled={signingId === log.id}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
                        {signingId === log.id ? 'Signing...' : 'Acknowledge Pre-Existing Condition'}
                      </button>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 font-mono text-[10px] space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 truncate">
                      <span className="font-semibold text-slate-400">PREV:</span> {log.previousHash}
                    </div>
                    <div className="flex items-center gap-2 text-slate-800 truncate">
                      <span className="font-semibold text-slate-400">HASH:</span> {log.currentHash}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}