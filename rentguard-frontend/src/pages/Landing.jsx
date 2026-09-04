import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Sparkles, FileText, CheckCircle, ArrowRight, Scale, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCta = () => {
    if (user) {
      navigate(user.role === 'LANDLORD' ? '/landlord' : '/tenant');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Cryptographically Verified Property Documentation
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Eliminate security deposit disputes with mathematical proof.
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          RentGuard immutably timestamps property condition logs into a sequential SHA-256 hash ledger. 
          Both landlords and tenants gain fair, verifiable, tamper-evident move-in and move-out records.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleCta}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('how-it-works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 transition"
          >
            How it works
          </button>
        </div>

        {/* Feature Snapshot Grid */}
        <div className="mt-16 border border-slate-200/80 rounded-2xl bg-white p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Cryptographic Hash Chains</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Every note and image is anchored to prior entries using SHA-256 hashing. Modifying a historical record invalidates the entire chain.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI Damage Assessment</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Automated computer vision triages normal wear-and-tear versus genuine tenant damage, providing objective repair cost ranges.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="w-9 h-9 rounded-lg bg-indigo-700 text-white flex items-center justify-center mb-3">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Dispute-Ready Ledger</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              One-click cryptographic verification offers an exportable record admissible for deposit refund negotiations and mediation.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="border-t border-slate-200 bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workflow</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">Simple, three-step protection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-2xl font-mono font-bold text-slate-400">01</span>
              <h4 className="text-base font-bold text-slate-900">Initialize Lease</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Landlords generate a secure property profile and generate a unique, 6-character connection code for the incoming tenant.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-2xl font-mono font-bold text-slate-400">02</span>
              <h4 className="text-base font-bold text-slate-900">Capture & Analyze</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Both parties capture inspection photos. The built-in AI inspector tags condition severity and repair estimates before block locking.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-2xl font-mono font-bold text-slate-400">03</span>
              <h4 className="text-base font-bold text-slate-900">Cryptographic Seal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Records are sealed immutably. Run real-time integrity audits anytime to prove that zero post-hoc modifications occurred.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">RentGuard</span> — Tamper-Proof Lease Ledger
          </div>
          <div>Built with SHA-256 cryptographic verification & AI inspection</div>
        </div>
      </footer>
    </div>
  );
}