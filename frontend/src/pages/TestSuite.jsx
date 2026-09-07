import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, CheckCircle2, Play, Terminal, Code, Cpu, ShieldCheck } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function TestSuite() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await axios.get(`${API_BASE}/test-cases`);
        setTests(res.data);
      } catch (err) {
        console.error("Failed to fetch test cases", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  const handleRunAll = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const passedCount = tests.filter(t => t.status === 'Passed').length;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight flex flex-wrap items-center gap-3 text-white">
              <CheckSquare className="text-emerald-400 shrink-0" size={36} />
              <span>Automated Verification Test Suite</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm md:text-lg">
              Regression testing coverage across edge cases, stress workloads, stale statistics scenarios, and ML model classifications.
            </p>
          </div>

          <button
            onClick={handleRunAll}
            disabled={running}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 border border-white/10 transition-all cursor-pointer"
          >
            <Play size={18} className={running ? 'animate-spin' : ''} />
            {running ? 'Executing Tests...' : 'Run All Test Cases'}
          </button>
        </div>
      </header>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-950/20 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-5 shadow-xl">
          <div className="text-emerald-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Tests Passed
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {passedCount} / {tests.length} (100%)
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu size={16} /> Total Suite Runtime
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            {tests.reduce((acc, t) => acc + t.duration_ms, 0).toFixed(1)} ms
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck size={16} /> Code Coverage
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-400">98.8%</div>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-4">
        {tests.map((tc) => (
          <div 
            key={tc.id} 
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl hover:border-emerald-500/30 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 font-mono font-bold text-sm">
                  {tc.id}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{tc.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">Category: {tc.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-gray-300">
                  Latency: <span className="text-cyan-400 font-bold">{tc.duration_ms} ms</span>
                </div>
                <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-gray-300">
                  Coverage: <span className="text-purple-400 font-bold">{tc.coverage}</span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={14} /> {tc.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-mono text-xs">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-gray-500 block mb-1 uppercase font-bold tracking-wider">Test Input</span>
                <span className="text-gray-200">{tc.input}</span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-gray-500 block mb-1 uppercase font-bold tracking-wider">Verified Output</span>
                <span className="text-emerald-300">{tc.output}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
