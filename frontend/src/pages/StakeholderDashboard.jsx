import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ShieldCheck } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const API_BASE = 'http://localhost:5000/api';

export default function StakeholderDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await axios.get(`${API_BASE}/dashboard/stats`);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-bold">Stakeholder View</h2>
        <p className="text-gray-400 mt-2">High-level system health and performance.</p>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <DashboardCard title="Total Queries Processed" value={stats.Total_Queries} icon={<Activity />} color="bg-blue-500/20 text-blue-400" />
          <DashboardCard title="System Health" value={stats.Critical_Regressions === 0 ? "Excellent" : "Needs Attention"} icon={<ShieldCheck />} color={stats.Critical_Regressions === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"} />
        </div>
      )}
      
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">Monthly Summary</h3>
        <p className="text-gray-400 leading-relaxed">
          The regression detection system is actively monitoring {stats?.Total_Queries || 0} queries. 
          Currently, there are {stats?.Critical_Regressions || 0} critical regressions identified that engineering is investigating.
          Overall database response time averages around {stats?.Average_Execution_Time_ms || 0}ms.
        </p>
      </div>
    </div>
  );
}
