import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, Clock, Filter, Terminal } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await axios.get(`${API_BASE}/alerts`);
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity.toUpperCase() === filterSeverity.toUpperCase();
  });

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
              <Bell className="text-orange-400" size={36} /> Real-Time Operational Alerts
            </h2>
            <p className="text-gray-400 mt-2 text-lg">
              Live telemetry notifications on query regressions, resource spikes, missing indexes, and statistics staleness.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
            <Filter size={14} className="text-gray-400 ml-2" />
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterSeverity === sev 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {filteredAlerts.map((alt) => {
          const isCritical = alt.severity.toLowerCase() === 'critical';
          const isHigh = alt.severity.toLowerCase() === 'high';

          return (
            <div 
              key={alt.id}
              className={`bg-white/5 backdrop-blur-md rounded-2xl border p-6 shadow-xl transition-all hover:translate-x-1 duration-300 relative overflow-hidden ${
                isCritical 
                  ? 'border-red-500/40 bg-red-950/10' 
                  : isHigh 
                  ? 'border-orange-500/40 bg-orange-950/10' 
                  : 'border-amber-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {isCritical ? (
                    <ShieldAlert size={24} className="text-red-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={24} className="text-orange-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-white">{alt.type}</h3>
                      <span className="text-xs font-mono text-gray-500">[{alt.id}]</span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock size={12} /> {alt.timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isCritical 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : isHigh 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    Status: {alt.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{alt.description}</p>

              <div className="bg-black/50 p-3 rounded-xl font-mono text-xs text-cyan-300 border border-white/5 flex items-center gap-2 overflow-x-auto">
                <Terminal size={14} className="text-gray-500 shrink-0" />
                <span>{alt.query}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
