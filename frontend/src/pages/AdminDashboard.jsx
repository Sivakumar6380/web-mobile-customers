import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Clock, ServerCrash, ArrowRight, Database, TrendingUp, CheckCircle } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler
);

const API_BASE = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await axios.get(`${API_BASE}/dashboard/stats`);
        setStats(statsRes.data);
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

  // Mock data for Line Chart
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Avg Execution Time (ms)',
        data: [45, 48, 52, 50, 68, 85, stats ? stats.Average_Execution_Time_ms : 90],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
    }
  };

  // Mock data for Doughnut Chart
  const doughnutData = {
    labels: ['Critical', 'Major', 'Minor', 'No Regression'],
    datasets: [{
      data: [stats ? stats.Critical_Regressions : 0, 150, 420, (stats ? stats.Total_Queries : 10000) - 570],
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#10b981'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#e5e7eb', padding: 20, font: { size: 13 } } }
    },
    cutout: '75%'
  };

  // Mock data for Bar Chart (Top Slow Queries)
  const barChartData = {
    labels: ['Q-1045', 'Q-2099', 'Q-3412', 'Q-1102', 'Q-5591'],
    datasets: [{
      label: 'Execution Time (ms)',
      data: [8400, 6200, 5100, 4800, 4200],
      backgroundColor: 'rgba(249, 115, 22, 0.2)',
      borderColor: '#f97316',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">System Overview</h2>
          <p className="text-gray-400 mt-3 text-lg">Comprehensive view of database health and critical performance alerts.</p>
        </div>
        <button 
          onClick={() => navigate('/regressions')}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-bold tracking-wide"
        >
          View Critical Regressions <ArrowRight size={18} />
        </button>
      </header>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <DashboardCard title="Total Queries" value={stats.Total_Queries} icon={<Activity />} color="bg-blue-500/20 text-blue-400 border border-blue-500/30" />
          <DashboardCard title="Slow Queries" value={stats.Slow_Queries} icon={<Clock />} color="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" />
          <DashboardCard title="Critical Regressions" value={stats.Critical_Regressions} icon={<ServerCrash />} color="bg-red-500/20 text-red-400 border border-red-500/30" />
          <DashboardCard title="Avg Exec Time" value={`${stats.Average_Execution_Time_ms}ms`} icon={<AlertTriangle />} color="bg-purple-500/20 text-purple-400 border border-purple-500/30" />
          
          <DashboardCard title="Avg CPU" value="45%" icon={<Activity />} color="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" />
          <DashboardCard title="Avg Memory" value="2.4 GB" icon={<Database />} color="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" />
          <DashboardCard title="Regression Rate" value="3.2%" icon={<TrendingUp />} color="bg-rose-500/20 text-rose-400 border border-rose-500/30" />
          <DashboardCard title="System Health" value="98%" icon={<CheckCircle />} color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <Activity className="text-blue-400" size={20}/> Global Execution Time Trend
           </h3>
           <div className="h-72">
             <Line data={lineChartData} options={lineChartOptions} />
           </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <AlertTriangle className="text-orange-400" size={20}/> Regression Distribution
           </h3>
           <div className="h-72 flex items-center justify-center">
             <Doughnut data={doughnutData} options={doughnutOptions} />
           </div>
        </div>

        {/* New Bar Chart: Top Slow Queries */}
        <div className="lg:col-span-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden mt-2">
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <Clock className="text-yellow-400" size={20}/> Top Slow Queries
           </h3>
           <div className="h-72">
             <Bar data={barChartData} options={barChartOptions} />
           </div>
        </div>
      </div>
    </div>
  );
}
