import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Plus, ArrowRight, Building2, Copy, Check, Users, ShieldCheck } from 'lucide-react';

export default function LandlordDashboard() {
  const [propertyName, setPropertyName] = useState('');
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  const fetchLeases = async () => {
    try {
      const res = await API.get('/lease/my-leases');
      setLeases(res.data.leases || []);
    } catch (err) {
      console.error('Failed to fetch leases:', err);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const handleCreateLease = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/lease/create', { propertyName });
      setPropertyName('');
      await fetchLeases();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create lease');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium mb-2">
          <Building2 className="w-3.5 h-3.5" /> Landlord Control Room
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Properties & Leases</h1>
        <p className="text-xs text-slate-500 mt-1">
          Deploy rental units, track tenants, and manage cryptographic condition ledgers.
        </p>
      </div>

      {/* Deploy Unit Form */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-slate-700" /> Deploy New Property
        </h2>
        <form onSubmit={handleCreateLease} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            placeholder="e.g. Abode Valley - Flat A-402"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition shadow-sm active:scale-[0.99] whitespace-nowrap"
          >
            {loading ? 'Deploying...' : 'Deploy Unit'}
          </button>
        </form>
      </div>

      {/* Property Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-700" /> Active Properties ({leases.length})
        </h2>

        {leases.length === 0 ? (
          <div className="p-10 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-400 text-xs">
            No properties deployed yet. Add your first apartment or flat above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leases.map((lease) => (
              <div
                key={lease.id}
                className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {lease.status}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{lease.propertyName}</h3>
                  </div>
                  <button
                    onClick={() => navigate(`/lease/${lease.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
                  >
                    Open Audit <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Tenant Invite Code</span>
                    <span className="font-mono tracking-widest font-bold text-slate-900 text-sm">
                      {lease.inviteCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(lease.inviteCode, lease.id)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 flex items-center gap-1 transition"
                  >
                    {copiedId === lease.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{lease.tenant ? lease.tenant.name : 'Waiting for tenant to join'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lease.auditLogs?.length || 0} Ledger Blocks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}