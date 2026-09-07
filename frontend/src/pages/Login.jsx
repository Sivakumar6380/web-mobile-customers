import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'Administrator') {
        navigate('/admin');
      } else if (loggedUser.role === 'Database Engineer') {
        navigate('/engineer');
      } else {
        navigate('/stakeholder');
      }
    } catch (err) {
      console.error("Login failed:", err);
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleForgotPassword = () => {
    alert("Please contact your Enterprise Database Administrator to trigger a password reset workflow.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black flex items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-lg shadow-blue-500/20">
            <Database className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Nexus<span className="text-blue-400">DB</span> Guardian
            </h1>
            <p className="text-xs text-gray-400 font-mono">Enterprise SQL Performance Intelligence</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-6">
          Sign In to Platform
        </h2>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-700 bg-black/40 text-blue-500 focus:ring-0" 
              />
              Remember Me
            </label>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="text-blue-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                Login to Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 text-center">
            Quick Demo Accounts (Click to Fill)
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button 
              onClick={() => handleQuickFill('admin@company.com', 'Admin@123')}
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 p-2 rounded-xl text-center transition-all font-mono"
            >
              <div className="font-bold text-[11px]">Admin</div>
              <div className="text-[9px] text-gray-400">Full Access</div>
            </button>

            <button 
              onClick={() => handleQuickFill('engineer@company.com', 'Engineer@123')}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 p-2 rounded-xl text-center transition-all font-mono"
            >
              <div className="font-bold text-[11px]">DB Engineer</div>
              <div className="text-[9px] text-gray-400">Technical</div>
            </button>

            <button 
              onClick={() => handleQuickFill('stakeholder@company.com', 'Stakeholder@123')}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-2 rounded-xl text-center transition-all font-mono"
            >
              <div className="font-bold text-[11px]">Stakeholder</div>
              <div className="text-[9px] text-gray-400">Executive</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
