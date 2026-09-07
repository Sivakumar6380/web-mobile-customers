import React, { useState } from 'react';
import axios from 'axios';
import { User, ShieldCheck, Mail, Building, Clock, Key, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/change-password`, {
        old_password: oldPassword,
        new_password: newPassword
      });
      setMessage('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
            <User className="text-blue-400" size={36} /> User Account & Security Profile
          </h2>
          <p className="text-gray-400 mt-2 text-lg">
            Manage personal profile settings, organization department info, and update authentication credentials.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* User Information Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{user.name}</h3>
              <div className="text-gray-400 text-sm font-mono mt-0.5 flex items-center gap-1.5">
                <Mail size={14} /> {user.email}
              </div>
            </div>
          </div>

          <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase font-mono tracking-wider border ${
            user.role === 'Administrator' 
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
              : user.role === 'Database Engineer' 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            Role: {user.role}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 font-mono text-sm">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-gray-400 text-xs uppercase font-bold mb-1 flex items-center gap-1.5 font-sans">
              <Building size={14} className="text-blue-400" /> Assigned Department
            </div>
            <div className="text-white font-semibold">{user.department}</div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-gray-400 text-xs uppercase font-bold mb-1 flex items-center gap-1.5 font-sans">
              <Clock size={14} className="text-emerald-400" /> Last Successful Login
            </div>
            <div className="text-white font-semibold">{user.last_login || 'Active Session'}</div>
          </div>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Key className="text-amber-400" size={22} /> Change Account Password
        </h3>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Current Password</label>
            <input 
              type="password" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)} 
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" 
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" 
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
