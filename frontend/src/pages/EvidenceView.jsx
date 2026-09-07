import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertOctagon, RotateCcw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function EvidenceView() {
  const { queryIndex } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Rollback Simulation State
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackComplete, setRollbackComplete] = useState(false);

  useEffect(() => {
    async function fetchEvidence() {
      try {
        const res = await axios.get(`${API_BASE}/regression/evidence/${queryIndex}`);
        setData(res.data);
      } catch (err) {
        setError("Failed to load evidence. It may not exist.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvidence();
  }, [queryIndex]);

  const handleRollback = () => {
    setIsRollingBack(true);
    setTimeout(() => {
      setIsRollingBack(false);
      setRollbackComplete(true);
    }, 2000);
  };

  if (loading) return <div className="text-white flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="text-red-400 font-bold flex justify-center mt-10 bg-red-500/10 p-4 rounded">{error}</div>;
  if (!data) return null;

  const { record, evidence } = data;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-white flex items-center gap-4">
          Regression Evidence Analysis 
          <span className={`text-sm px-4 py-1.5 rounded-full border shadow-lg ${evidence.severity > 1 ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-yellow-500/20'}`}>
            Severity: {evidence.severity}
          </span>
        </h2>
        <div className="bg-black/40 p-6 rounded-xl mt-6 border border-white/10 shadow-inner">
          <span className="text-blue-400 font-bold block mb-2 uppercase tracking-wider text-sm">Target SQL Query</span>
          <pre className="font-mono text-gray-300 text-sm whitespace-pre-wrap">{record.query_text}</pre>
        </div>
      </header>

      {/* Rollback Simulation Overlay */}
      {isRollingBack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-blue-500/50 p-10 rounded-2xl flex flex-col items-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
            <RotateCcw className="text-blue-500 animate-spin mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">Simulating Rollback...</h2>
            <p className="text-gray-400">Reverting schema changes and restoring optimal query plan.</p>
          </div>
        </div>
      )}

      {rollbackComplete ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-10 text-center animate-in zoom-in duration-500">
          <CheckCircle className="text-emerald-400 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-white mb-2">Rollback Successful</h2>
          <p className="text-gray-300 text-lg mb-6">The database has successfully reverted to the previous execution plan. Performance has returned to baseline.</p>
          <button onClick={() => navigate('/admin')} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
            Return to Dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <CheckCircle size={24} /> Previous Optimal Plan
              </h3>
              <pre className="font-mono text-sm text-gray-300 bg-black/40 p-5 rounded-xl overflow-x-auto border border-white/5 leading-relaxed">
                {evidence.execution_plan_before}
              </pre>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] -z-10 pointer-events-none"></div>
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <AlertOctagon size={24} /> Degraded Execution Plan
              </h3>
              <pre className="font-mono text-sm text-gray-300 bg-black/40 p-5 rounded-xl overflow-x-auto border border-white/5 leading-relaxed">
                {evidence.execution_plan_after}
              </pre>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl mb-10">
            <h3 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Automated Root Cause Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Impact Analysis</p>
                <p className="text-xl font-bold text-white">{evidence.execution_time_comparison}</p>
              </div>
              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Index Deviation</p>
                <p className="text-xl font-bold text-orange-400">{evidence.index_comparison}</p>
              </div>
              <div className="bg-red-500/10 p-5 rounded-xl border border-red-500/20 md:col-span-2">
                <p className="text-red-400/80 text-xs font-bold uppercase tracking-wider mb-1">Primary Culprit</p>
                <p className="text-lg font-semibold text-red-200">{evidence.reason_for_regression}</p>
              </div>
            </div>
            
            <div className="mt-10 flex gap-6">
              <button onClick={handleRollback} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">
                <RotateCcw size={20} /> Simulate Rollback
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
