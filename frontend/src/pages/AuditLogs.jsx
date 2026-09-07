import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Clock, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await axios.get(`${API_BASE}/audit-logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.user_email.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.role.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
          <ShieldCheck className="text-indigo-400" size={36} /> Enterprise Security Audit Logs
        </h2>
        <p className="text-gray-400 mt-2 text-lg">
          Tamper-evident audit trail recording user authentication, authorization checks, configuration modifications, and administrative operations.
        </p>
      </header>

      {/* Filter / Search Bar */}
      <div className="mb-6 flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search audit trail by user, action, or log ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">Total Log Entries: <strong className="text-white">{filteredLogs.length}</strong></span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-xs font-mono">
                <th className="pb-3">Log ID</th>
                <th className="pb-3">User & Role</th>
                <th className="pb-3">Action Description</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredLogs.map((log) => {
                const isDenied = log.status.toLowerCase() === 'denied' || log.status.toLowerCase() === 'failure' || log.status.toLowerCase() === 'blocked';

                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-purple-300 font-bold">{log.id}</td>
                    <td className="py-4 font-sans">
                      <div className="text-white font-bold text-sm">{log.user_name}</div>
                      <div className="text-gray-400 font-mono text-xs">{log.user_email}</div>
                      <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-mono font-bold mt-1 inline-block">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-4 text-gray-200 font-sans max-w-xs leading-snug">{log.action}</td>
                    <td className="py-4 text-gray-400">{log.timestamp}</td>
                    <td className="py-4 text-cyan-300">{log.ip_address}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold border uppercase text-[10px] flex items-center gap-1 w-fit ${
                        isDenied 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isDenied ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
