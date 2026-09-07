import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, Database, AlertCircle, CheckCircle, RefreshCw, BarChart2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function StatisticsAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get(`${API_BASE}/statistics-analysis`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch statistics analysis", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
              <Activity className="text-rose-400" size={36} /> Statistics & Data Drift Analysis
            </h2>
            <p className="text-gray-400 mt-2 text-lg">
              Monitor table statistics staleness, cardinality estimate drift, and index fragmentation across database objects.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl font-mono text-xs">
            <div>
              <span className="text-gray-400 block">Global Stats Version:</span>
              <span className="text-rose-400 font-bold">{data.statistics_version}</span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-gray-400 block">Overall Fragmentation:</span>
              <span className="text-amber-400 font-bold">{data.overall_fragmentation}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tables Detailed Card Grid */}
      <div className="space-y-6">
        {data.tables.map((tbl, i) => {
          const isCritical = tbl.drift_percentage.includes('8') || tbl.recommendation.includes('CRITICAL');
          const isWarning = tbl.recommendation.includes('HIGH');

          return (
            <div 
              key={i} 
              className={`bg-white/5 backdrop-blur-md rounded-2xl border p-6 shadow-xl relative overflow-hidden transition-all duration-300 ${
                isCritical 
                  ? 'border-red-500/40 bg-red-950/10' 
                  : isWarning 
                  ? 'border-amber-500/40 bg-amber-950/10' 
                  : 'border-white/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <Database size={24} className={isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'} />
                  <div>
                    <h3 className="text-2xl font-extrabold text-white font-mono">{tbl.table_name}</h3>
                    <div className="text-gray-400 text-xs flex items-center gap-2 mt-0.5 font-mono">
                      <Clock size={12} /> Last Updated: {tbl.last_updated} ({tbl.stats_version})
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 font-mono">
                    <span className="text-gray-400 text-xs block">Fragmentation</span>
                    <span className="text-amber-300 font-bold text-sm">{tbl.fragmentation}</span>
                  </div>
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 font-mono">
                    <span className="text-gray-400 text-xs block">Cardinality Drift</span>
                    <span className={`font-bold text-sm ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {tbl.drift_percentage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rows Estimation vs Actual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 font-mono text-xs">
                  <div className="text-gray-400 mb-1 flex items-center justify-between">
                    <span>Estimated Rows (Optimizer view)</span>
                    <span className="text-gray-200 font-bold">{tbl.estimated_rows.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 font-mono text-xs">
                  <div className="text-gray-400 mb-1 flex items-center justify-between">
                    <span>Actual Rows (Storage engine view)</span>
                    <span className="text-rose-300 font-bold">{tbl.actual_rows.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-3 ${
                isCritical 
                  ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                  : isWarning 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {isCritical || isWarning ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle size={20} className="shrink-0" />}
                <div>
                  <span className="font-mono text-xs block text-gray-400 uppercase tracking-wider">Recommendation</span>
                  {tbl.recommendation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
