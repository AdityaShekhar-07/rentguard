import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { KeyRound, ArrowRight, ShieldCheck, Home, UserCheck } from 'lucide-react';

export default function TenantDashboard() {
  const [activeLease, setActiveLease] = useState(null);
  const [checking, setChecking] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveLease = async () => {
      try {
        const res = await API.get('/lease/active-lease');
        if (res.data.lease) {
          setActiveLease(res.data.lease);
        }
      } catch (err) {
        console.error('Failed to load active lease:', err);
      } finally {
        setChecking(false);
      }
    };
    fetchActiveLease();
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/lease/join', { inviteCode });
      navigate(`/lease/${res.data.lease.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or inactive invite code');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center text-xs text-slate-500">
        Loading property profile...
      </div>
    );
  }

  // State 1: Tenant already has a home/lease assigned
  if (activeLease) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-700 font-semibold">
                Current Residence
              </span>
              <h1 className="text-xl font-bold text-slate-900">{activeLease.propertyName}</h1>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Landlord:</span>
              <span className="font-semibold text-slate-900">{activeLease.landlord?.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Contact:</span>
              <span className="font-mono text-slate-700">{activeLease.landlord?.email}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/lease/${activeLease.id}`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition text-xs shadow-sm active:scale-[0.99]"
          >
            Enter Cryptographic Audit Vault <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            SHA-256 Protected Ledger
          </div>
        </div>
      </div>
    );
  }

  // State 2: Tenant has not joined a flat yet
  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 text-center space-y-6 animate-fade-in transition-all">
        <div className="inline-flex p-3 bg-slate-100 text-slate-800 rounded-xl">
          <KeyRound className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Join Lease Agreement</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter the 6-character code provided by your landlord
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input
              type="text"
              required
              maxLength={6}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. CCD067"
              className="w-full text-center tracking-[0.3em] uppercase font-mono text-xl py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || inviteCode.length < 6}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-xl transition duration-150 text-xs shadow-sm hover:shadow active:scale-[0.99]"
          >
            {loading ? 'Validating Key...' : 'Join Property Ledger'}{' '}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Cryptographically backed audit log
        </div>
      </div>
    </div>
  );
}