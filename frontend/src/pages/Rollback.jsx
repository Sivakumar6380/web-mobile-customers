import React, { useState } from 'react';
import { RotateCcw, CheckCircle, AlertTriangle, Terminal, ArrowDown, ArrowUp } from 'lucide-react';

export default function Rollback() {
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleRollback = () => {
    setIsRollingBack(true);
    setLogs(['Initiating rollback sequence...', 'Connecting to production cluster...']);
    setTimeout(() => setLogs(prev => [...prev, 'Switching traffic to v1.1.0...']), 1000);
    setTimeout(() => setLogs(prev => [...prev, 'Verifying database connections...']), 2000);
    setTimeout(() => {
      setLogs(prev => [...prev, 'Rollback successful. Version v1.1.0 active.']);
      setIsRollingBack(false);
    }, 3500);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight">System Rollback</h2>
        <p className="text-gray-400 mt-3 text-lg">Compare releases and simulate rollback procedures.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2"><AlertTriangle /> Current Release (v1.2.0)</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-red-500/20 pb-2"><span className="text-gray-300">Avg Exec Time</span><span className="text-red-400 font-bold flex items-center gap-1">125ms <ArrowUp size={16}/></span></div>
            <div className="flex justify-between border-b border-red-500/20 pb-2"><span className="text-gray-300">CPU Usage</span><span className="text-red-400 font-bold">78%</span></div>
            <div className="flex justify-between border-b border-red-500/20 pb-2"><span className="text-gray-300">Critical Regressions</span><span className="text-red-400 font-bold">42</span></div>
          </div>
        </div>

        <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle /> Previous Release (v1.1.0)</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-emerald-500/20 pb-2"><span className="text-gray-300">Avg Exec Time</span><span className="text-emerald-400 font-bold flex items-center gap-1">45ms <ArrowDown size={16}/></span></div>
            <div className="flex justify-between border-b border-emerald-500/20 pb-2"><span className="text-gray-300">CPU Usage</span><span className="text-emerald-400 font-bold">32%</span></div>
            <div className="flex justify-between border-b border-emerald-500/20 pb-2"><span className="text-gray-300">Critical Regressions</span><span className="text-emerald-400 font-bold">0</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">Performance Impact</h3>
          <p className="text-gray-400">Reverting to v1.1.0 is estimated to improve performance by 64% and resolve all critical regressions.</p>
        </div>
        <button 
          onClick={handleRollback}
          disabled={isRollingBack}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${isRollingBack ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/25'}`}
        >
          {isRollingBack ? <RotateCcw className="animate-spin" /> : <RotateCcw />}
          {isRollingBack ? 'Rolling Back...' : 'Execute Rollback'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="bg-black/60 rounded-2xl border border-gray-800 p-6 font-mono text-sm shadow-xl mt-8">
          <div className="flex items-center gap-2 text-gray-500 mb-4 border-b border-gray-800 pb-2">
            <Terminal size={18} /> Rollback Execution Logs
          </div>
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="text-emerald-400">{`> ${log}`}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
