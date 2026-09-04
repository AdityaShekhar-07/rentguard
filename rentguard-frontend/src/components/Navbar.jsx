import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <div 
        className="flex items-center gap-2 cursor-pointer select-none" 
        onClick={() => navigate('/')}
      >
        <div className="p-1.5 bg-slate-900 text-white rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900">
          RentGuard
        </span>
      </div>

      {!isAuthPage && user ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-800 block">{user.name}</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
              {user.role}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      ) : !isAuthPage && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md transition"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}