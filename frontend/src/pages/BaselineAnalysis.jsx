import React from 'react';
import { Activity, Clock, Zap, Target } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function BaselineAnalysis() {
  const topQueries = [
    { id: 'Q-849', time: '1450ms', baseline: '120ms', diff: '+1108%', desc: 'SELECT * FROM users JOIN orders...' },
    { id: 'Q-112', time: '980ms', baseline: '95ms', diff: '+931%', desc: 'UPDATE inventory SET stock = ...' },
    { id: 'Q-993', time: '850ms', baseline: '110ms', diff: '+672%', desc: 'SELECT COUNT(*) FROM activity_logs...' },
    { id: 'Q-445', time: '720ms', baseline: '80ms', diff: '+800%', desc: 'DELETE FROM temp_sessions WHERE...' },
    { id: 'Q-221', time: '650ms', baseline: '65ms', diff: '+900%', desc: 'INSERT INTO audit_trail (user_id...' },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight">Baseline Analysis</h2>
        <p className="text-gray-400 mt-3 text-lg">Statistical performance breakdown against historical baselines.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <DashboardCard title="Average Exec Time" value="125ms" icon={<Activity />} color="bg-blue-500/20 text-blue-400 border border-blue-500/30" />
        <DashboardCard title="Median Exec Time" value="48ms" icon={<Target />} color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" />
        <DashboardCard title="95th Percentile" value="850ms" icon={<Zap />} color="bg-orange-500/20 text-orange-400 border border-orange-500/30" />
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
          <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-purple-400"/> Top Slow Queries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm">
                <th className="p-4 font-semibold">Query ID</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Current Time</th>
                <th className="p-4 font-semibold">Baseline</th>
                <th className="p-4 font-semibold">Deviation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topQueries.map((q, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-blue-400">{q.id}</td>
                  <td className="p-4 font-mono text-sm text-gray-300 truncate max-w-xs">{q.desc}</td>
                  <td className="p-4 text-red-400 font-bold">{q.time}</td>
                  <td className="p-4 text-emerald-400">{q.baseline}</td>
                  <td className="p-4 text-orange-400 bg-orange-500/10 font-bold">{q.diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
