import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, TrendingUp, Cpu, Server } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE = 'http://localhost:5000/api';

export default function EngineerDashboard() {
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

  // Mock Scatter data for CPU vs Memory
  const generateScatterData = () => {
    return Array.from({ length: 50 }, () => ({
      x: Math.random() * 100, // CPU usage %
      y: Math.random() * 8000 + 2000 // Memory KB
    }));
  };

  const scatterData = {
    datasets: [
      {
        label: 'Normal Queries',
        data: generateScatterData(),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
      {
        label: 'Regressions (Anomalies)',
        data: Array.from({ length: 10 }, () => ({
          x: Math.random() * 50 + 50,
          y: Math.random() * 10000 + 8000 
        })),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        pointRadius: 6,
      }
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e5e7eb' } }
    },
    scales: {
      x: { 
        title: { display: true, text: 'CPU Utilization (%)', color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
        ticks: { color: '#9ca3af' } 
      },
      y: { 
        title: { display: true, text: 'Memory Allocation (KB)', color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
        ticks: { color: '#9ca3af' } 
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Server className="text-blue-500" size={36} /> DB Engineer Console
        </h2>
        <p className="text-gray-400 mt-3 text-lg">Deep-dive technical metrics, resource utilization, and execution analysis.</p>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DashboardCard title="Avg Execution Time" value={`${stats.Average_Execution_Time_ms}ms`} icon={<TrendingUp />} color="bg-blue-500/20 text-blue-400 border border-blue-500/30" />
          <DashboardCard title="Total Regressions" value={stats.Critical_Regressions} icon={<Database />} color="bg-orange-500/20 text-orange-400 border border-orange-500/30" />
          <DashboardCard title="CPU Wait Time Avg" value="45ms" icon={<Cpu />} color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" />
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Cpu className="text-emerald-400" size={24}/> Resource Utilization Profile (CPU vs Memory)
        </h3>
        <p className="text-gray-400 mb-8 text-sm">Identifies queries that are disproportionately consuming resources, often indicating missing indexes or poor query planning.</p>
        <div className="h-[400px]">
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </div>
    </div>
  );
}
