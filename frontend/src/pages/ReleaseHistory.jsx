import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GitMerge, Calendar, Layers, Activity, AlertTriangle, RotateCcw, CheckCircle, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ReleaseHistory() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReleases() {
      try {
        const res = await axios.get(`${API_BASE}/release-history`);
        setReleases(res.data);
      } catch (err) {
        console.error("Failed to fetch release history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReleases();
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
              <GitMerge className="text-purple-400" size={36} /> Release History & Impacts
            </h2>
            <p className="text-gray-400 mt-2 text-lg">
              Audit historical deployments, schema modifications, and performance delta across software releases.
            </p>
          </div>
          <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 font-mono text-sm font-semibold">
            Total Releases tracked: {releases.length}
          </span>
        </div>
      </header>

      <div className="space-y-6">
        {releases.map((rel, index) => {
          const isNegative = rel.performance_impact.includes('+') || rel.regression_count > 0;
          return (
            <div 
              key={index} 
              className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-400">
                    <GitMerge size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-extrabold text-white font-mono">{rel.release_version}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                        rel.regression_count > 0 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {rel.regression_count > 0 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                        {rel.regression_count} Regressions
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                      <Calendar size={14} /> Deployed on: <span className="text-gray-200">{rel.deployment_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-400">Queries Affected</div>
                    <div className="text-lg font-bold font-mono text-cyan-400">{rel.queries_affected}</div>
                  </div>

                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-400">Rollback Status</div>
                    <div className="text-sm font-semibold flex items-center gap-1 text-gray-200 mt-1">
                      <RotateCcw size={14} className="text-amber-400" /> {rel.rollback_availability}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="text-xs uppercase font-bold tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                    <Layers size={16} /> Schema Modifications
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{rel.schema_changes}</p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="text-xs uppercase font-bold tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                    <Activity size={16} /> Performance Impact Assessment
                  </div>
                  <p className={`text-sm font-semibold ${isNegative ? 'text-red-400' : 'text-emerald-400'}`}>
                    {rel.performance_impact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
