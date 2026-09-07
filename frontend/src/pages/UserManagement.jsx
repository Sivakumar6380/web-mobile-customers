import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Edit3, Trash2, Key, ShieldCheck, CheckCircle2, XCircle, Search } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Database Engineer',
    department: 'Engineering',
    password: 'User@123',
    enabled: true
  });

  const [resetPwValue, setResetPwValue] = useState('NewPass@123');
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/users`, formData);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'Database Engineer', department: 'Engineering', password: 'User@123', enabled: true });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create user");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await axios.put(`${API_BASE}/users/${selectedUser.id}`, {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        enabled: formData.enabled
      });
      setShowEditModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(`${API_BASE}/users/${selectedUser.id}/reset-password`, { new_password: resetPwValue });
      alert(`Password for ${selectedUser.email} reset successfully!`);
      setShowResetModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reset password");
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      enabled: u.enabled
    });
    setShowEditModal(true);
  };

  const openResetModal = (u) => {
    setSelectedUser(u);
    setResetPwValue('NewPass@123');
    setShowResetModal(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight flex flex-wrap items-center gap-3 text-white">
              <Users className="text-purple-400 shrink-0" size={36} />
              <span>User Management & RBAC Administration</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm md:text-lg">
              Manage system accounts, assign role permissions, reset credentials, and toggle account access.
            </p>
          </div>

          <button
            onClick={() => {
              setFormData({ name: '', email: '', role: 'Database Engineer', department: 'Engineering', password: 'User@123', enabled: true });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <UserPlus size={18} /> Add New User
          </button>
        </div>
      </header>

      {/* Filter / Search Bar */}
      <div className="mb-6 flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">Total Users: <strong className="text-white">{filteredUsers.length}</strong></span>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-xs font-mono">
                <th className="pb-3">User Details</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Login</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-white text-sm font-sans">{u.name}</div>
                    <div className="text-gray-400">{u.email}</div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-lg font-bold border uppercase text-[10px] ${
                      u.role === 'Administrator' 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                        : u.role === 'Database Engineer' 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">{u.department}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 ${
                      u.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {u.enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {u.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400">{u.last_login}</td>
                  <td className="py-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal(u)} 
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 border border-blue-500/30"
                      title="Edit User Role / Status"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => openResetModal(u)} 
                      className="p-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 border border-amber-500/30"
                      title="Reset User Password"
                    >
                      <Key size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30"
                      title="Delete Account"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserPlus className="text-purple-400" size={20} /> Create New User
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm font-sans">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white font-mono" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Assign Role</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Database Engineer">Database Engineer</option>
                  <option value="Stakeholder">Stakeholder</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Department</label>
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Initial Password</label>
                <input 
                  type="text" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white font-mono" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit3 className="text-blue-400" size={20} /> Edit User Permissions & Role
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm font-sans">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Assigned Role</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Database Engineer">Database Engineer</option>
                  <option value="Stakeholder">Stakeholder</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Department</label>
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white" 
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="userEnabled"
                  checked={formData.enabled} 
                  onChange={(e) => setFormData({...formData, enabled: e.target.checked})} 
                  className="rounded border-gray-700 bg-black/40 text-blue-500" 
                />
                <label htmlFor="userEnabled" className="text-sm font-semibold cursor-pointer">Account Enabled</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Key className="text-amber-400" size={20} /> Reset User Password
            </h3>
            <p className="text-xs text-gray-400 mb-4">Reset password for <strong className="text-white">{selectedUser.email}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">New Password</label>
                <input 
                  type="text" 
                  value={resetPwValue} 
                  onChange={(e) => setResetPwValue(e.target.value)} 
                  required 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white font-mono" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetPassword}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
