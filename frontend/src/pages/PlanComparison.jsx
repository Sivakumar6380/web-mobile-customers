import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GitCommit, ArrowLeft, Clock, DollarSign, Database, Hash, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

export default function PlanComparison() {
  const { queryIndex } = useParams();
  const navigate = useNavigate();
  const targetIndex = queryIndex || 0;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await axios.get(`${API_BASE}/queries/plan-comparison/${targetIndex}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch plan comparison", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [targetIndex]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-4">
          <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} /> Regression: +{data.regression_percentage}%
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            Plan Diff Score: {data.plan_difference_score}
          </span>
        </div>
      </div>

      <header className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
          <GitCommit className="text-cyan-400" size={36} /> Execution Plan Comparison
        </h2>
        <p className="text-gray-400 mt-2 text-lg">Side-by-side analysis of physical operators, cost metrics, and plan hash drift.</p>
      </header>

      {/* SQL Statement Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-8 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-2">
            Target SQL Query <span className="font-mono text-gray-500">[{data.query_id}]</span>
          </span>
          <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded border border-purple-500/20">
            Hash: {data.plan_hash}
          </span>
        </div>
        <pre className="font-mono text-sm text-gray-200 bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto">
          {data.sql_query}
        </pre>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* BEFORE PLAN (GREEN) */}
        <div className="bg-emerald-950/20 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={20} /> Execution Plan BEFORE (Optimal)
            </h3>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/30">
              Baseline: {data.execution_time_before} ms
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-black/30 p-3 rounded border border-emerald-500/15">
                <span className="text-gray-500 block mb-0.5">Estimated Cost</span>
                <span className="text-emerald-300 font-bold">{data.estimated_cost}</span>
              </div>
              <div className="bg-black/30 p-3 rounded border border-emerald-500/15">
                <span className="text-gray-500 block mb-0.5">Index Used</span>
                <span className="text-emerald-300 font-bold">{data.index_used_before}</span>
              </div>
              <div className="bg-black/30 p-3 rounded border border-emerald-500/15">
                <span className="text-gray-500 block mb-0.5">Scan Type</span>
                <span className="text-emerald-300 font-bold">{data.scan_type_before}</span>
              </div>
              <div className="bg-black/30 p-3 rounded border border-emerald-500/15">
                <span className="text-gray-500 block mb-0.5">Join Type</span>
                <span className="text-emerald-300 font-bold">{data.join_type_before}</span>
              </div>
            </div>

            <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-emerald-200/90 border border-emerald-500/20 overflow-x-auto">
              <div className="text-emerald-400 font-bold mb-2">// Physical Plan Tree</div>
              <pre>{data.plan_before}</pre>
            </div>
          </div>
        </div>

        {/* AFTER PLAN (RED) */}
        <div className="bg-red-950/20 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={20} /> Execution Plan AFTER (Degraded)
            </h3>
            <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2.5 py-1 rounded border border-red-500/30">
              Current: {data.execution_time_after} ms
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-black/30 p-3 rounded border border-red-500/15">
                <span className="text-gray-500 block mb-0.5">Actual Cost</span>
                <span className="text-red-300 font-bold">{data.actual_cost}</span>
              </div>
              <div className="bg-black/30 p-3 rounded border border-red-500/15">
                <span className="text-gray-500 block mb-0.5">Index Used</span>
                <span className="text-red-300 font-bold">{data.index_used_after}</span>
              </div>
              <div className="bg-black/30 p-3 rounded border border-red-500/15">
                <span className="text-gray-500 block mb-0.5">Scan Type</span>
                <span className="text-red-300 font-bold">{data.scan_type_after}</span>
              </div>
              <div className="bg-black/30 p-3 rounded border border-red-500/15">
                <span className="text-gray-500 block mb-0.5">Join Type</span>
                <span className="text-red-300 font-bold">{data.join_type_after}</span>
              </div>
            </div>

            <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-red-200/90 border border-red-500/20 overflow-x-auto">
              <div className="text-red-400 font-bold mb-2">// Physical Plan Tree</div>
              <pre>{data.plan_after}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Rows & Metrics Detail Table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Detailed Plan Execution Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Rows Processed</div>
            <div className="text-xl font-bold font-mono text-white">{data.rows_processed.toLocaleString()}</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Rows Scanned</div>
            <div className="text-xl font-bold font-mono text-yellow-400">{data.rows_scanned.toLocaleString()}</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Rows Returned</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{data.rows_returned.toLocaleString()}</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Scan Efficiency</div>
            <div className="text-xl font-bold font-mono text-red-400">
              {(data.rows_returned / Math.max(1, data.rows_scanned) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
