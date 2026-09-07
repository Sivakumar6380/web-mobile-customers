import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getRoleHome = () => {
    if (!user) return '/login';
    if (user.role === 'Administrator') return '/admin';
    if (user.role === 'Database Engineer') return '/engineer';
    return '/stakeholder';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-red-950/20 backdrop-blur-xl border border-red-500/30 p-10 rounded-3xl max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="mx-auto w-20 h-20 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center border border-red-500/30 mb-6 shadow-lg shadow-red-500/20">
          <ShieldAlert size={44} />
        </div>

        <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 mb-4">
          <Lock size={14} /> 403 Forbidden Access
        </span>

        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Access Denied
        </h2>

        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          Your role (<span className="text-red-400 font-bold font-mono">{user?.role || 'Guest'}</span>) does not possess the requisite security permissions to view or execute actions in this module.
        </p>

        {user && (
          <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-xs font-mono text-gray-400 mb-8 text-left space-y-1">
            <div>User: <span className="text-white font-bold">{user.email}</span></div>
            <div>Department: <span className="text-gray-300">{user.department}</span></div>
            <div>Security Status: <span className="text-amber-400">Restricted Route</span></div>
          </div>
        )}

        <button
          onClick={() => navigate(getRoleHome())}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-500/25 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} /> Return to Allowed Dashboard
        </button>
      </div>
    </div>
  );
}
