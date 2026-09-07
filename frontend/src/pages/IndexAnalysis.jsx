import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SlidersHorizontal, AlertTriangle, CheckCircle, Trash2, Copy, Sparkles, Database } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function IndexAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIndexes() {
      try {
        const res = await axios.get(`${API_BASE}/index-analysis`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch index analysis", err);
      } finally {
        setLoading(false);
      }
    }
    fetchIndexes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
          <SlidersHorizontal className="text-yellow-400" size={36} /> Index Advisory & Analysis
        </h2>
        <p className="text-gray-400 mt-2 text-lg">
          Detect missing indexes causing table scans, identify unused indexes wasting storage, and resolve duplicate indexes.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total Indexes</div>
          <div className="text-3xl font-extrabold font-mono text-white">{data.summary.total_indexes}</div>
        </div>

        <div className="bg-red-950/20 backdrop-blur-md rounded-2xl border border-red-500/30 p-5 shadow-xl">
          <div className="text-red-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Missing Indexes
          </div>
          <div className="text-3xl font-extrabold font-mono text-red-400">{data.summary.missing_indexes}</div>
        </div>

        <div className="bg-amber-950/20 backdrop-blur-md rounded-2xl border border-amber-500/30 p-5 shadow-xl">
          <div className="text-amber-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <Trash2 size={14} /> Unused Indexes
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">{data.summary.unused_indexes}</div>
        </div>

        <div className="bg-purple-950/20 backdrop-blur-md rounded-2xl border border-purple-500/30 p-5 shadow-xl">
          <div className="text-purple-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <Copy size={14} /> Duplicate Indexes
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-400">{data.summary.duplicate_indexes}</div>
        </div>
      </div>

      {/* Missing Indexes Advisory */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={24} /> High-Impact Missing Index Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.missing_indexes.map((mi, i) => (
            <div key={i} className="bg-black/40 rounded-xl border border-yellow-500/30 p-5 font-mono text-xs relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Database size={16} className="text-yellow-400" /> Table: {mi.table}
                </span>
                <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                  mi.impact === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {mi.impact} Impact
                </span>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 mb-3 text-cyan-300">
                CREATE INDEX CONCURRENTLY idx_{mi.table}_opt ON {mi.table} ({mi.suggested_columns});
              </div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle size={14} /> Estimated Savings: {mi.estimated_savings}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unused & Duplicate Indexes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trash2 className="text-amber-400" size={22} /> Unused Indexes (Candidates for Removal)
          </h3>
          <div className="space-y-4 font-mono text-xs">
            {data.unused_indexes.map((ui, i) => (
              <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-300 font-bold">{ui.index_name}</span>
                  <span className="text-gray-400">{ui.size_mb} MB</span>
                </div>
                <div className="text-gray-400 mb-2">Table: <span className="text-gray-200">{ui.table}</span> | Index Scans: <span className="text-red-400 font-bold">{ui.scans}</span></div>
                <div className="text-gray-300 italic bg-amber-500/10 p-2 rounded border border-amber-500/20">{ui.recommendation}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Copy className="text-purple-400" size={22} /> Duplicate / Redundant Indexes
          </h3>
          <div className="space-y-4 font-mono text-xs">
            {data.duplicate_indexes.map((di, i) => (
              <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/10">
                <div className="text-white font-bold mb-2">Table: {di.table}</div>
                <div className="space-y-1 text-gray-400 mb-3">
                  <div>Index 1: <span className="text-purple-300">{di.index1}</span></div>
                  <div>Index 2: <span className="text-purple-300">{di.index2}</span></div>
                </div>
                <div className="text-purple-300 bg-purple-500/10 p-2 rounded border border-purple-500/20">{di.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
