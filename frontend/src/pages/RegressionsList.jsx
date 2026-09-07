import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function RegressionsList() {
  const [slowQueries, setSlowQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const slowRes = await axios.get(`${API_BASE}/queries/top-slow`);
        setSlowQueries(slowRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={36} /> Critical Regressions
        </h2>
        <p className="text-gray-400 mt-3 text-lg">Detailed list of queries exhibiting severe performance degradation requiring immediate attention.</p>
      </header>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Detected Anomalies</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/20 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-8 py-5 font-semibold">Query Definition</th>
                <th className="px-8 py-5 font-semibold">Performance</th>
                <th className="px-8 py-5 font-semibold">Severity</th>
                <th className="px-8 py-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {slowQueries.map((q, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-mono text-xs text-blue-400 mb-2 bg-blue-900/20 inline-block px-2 py-1 rounded border border-blue-500/20">{q.plan_hash.substring(0, 16)}...</div>
                    <div className="truncate w-80 text-gray-200 font-medium" title={q.query_text}>{q.query_text}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-red-300 font-bold">{q.execution_time_ms} ms</span>
                      <span className="font-mono text-gray-500 text-xs text-nowrap">{q.memory_usage_kb} KB Memory</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      q.severity === 3 ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                      q.severity === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {q.regression_label}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => navigate(`/evidence/${idx}`)}
                      className="text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
