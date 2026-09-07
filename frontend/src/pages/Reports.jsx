import React, { useState } from 'react';
import { Download, FileText, Activity, AlertTriangle, Database, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Reports() {
  const [toast, setToast] = useState(null);

  const triggerDownload = (type) => {
    // In a real app, this would use window.location.href or an anchor tag to trigger a file download.
    // For this demonstration, we'll just show the toast.
    // window.location.href = `${API_BASE}/reports/download/${type}`;
    
    // Simulating download initiation
    showToast(`Initiating download for ${type} report...`);
    
    setTimeout(() => {
      // Simulate success
      showToast(`${type} report downloaded successfully!`, 'success');
    }, 1500);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(current => current && current.id === toast?.id ? current : null);
    }, 3000);
  };

  const reports = [
    {
      id: 'performance',
      title: 'Performance Overview',
      description: 'Comprehensive CSV report of system execution times, disk reads, and resource utilization across all queries.',
      icon: <Activity className="text-blue-400" size={32} />,
      bgClass: 'bg-blue-500/10',
      borderClass: 'border-blue-500/20',
      btnClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
    },
    {
      id: 'regressions',
      title: 'Critical Regressions',
      description: 'Detailed breakdown of all major and critical query plan regressions detected in the last 30 days.',
      icon: <AlertTriangle className="text-red-400" size={32} />,
      bgClass: 'bg-red-500/10',
      borderClass: 'border-red-500/20',
      btnClass: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
    },
    {
      id: 'costs',
      title: 'Cost Analysis',
      description: 'Financial impact report based on query execution counts and resource consumption costs.',
      icon: <Database className="text-yellow-400" size={32} />,
      bgClass: 'bg-yellow-500/10',
      borderClass: 'border-yellow-500/20',
      btnClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out flex flex-col h-full text-gray-200 relative">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
          <FileText className="text-emerald-500" size={36} /> Enterprise Reports
        </h2>
        <p className="text-gray-400 mt-2 text-lg">Generate and download comprehensive system reports in CSV format.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
          <div key={report.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col group hover:bg-white/10 transition-all">
            <div className={`p-4 rounded-xl ${report.bgClass} border ${report.borderClass} w-fit mb-6`}>
              {report.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{report.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-8">
              {report.description}
            </p>
            <button 
              onClick={() => triggerDownload(report.id)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all border ${report.btnClass}`}
            >
              <Download size={18} /> Download CSV
            </button>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="absolute bottom-8 right-8 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-gray-900 border border-white/20 shadow-2xl rounded-xl p-4 flex items-center gap-3 min-w-[300px]">
            {toast.type === 'success' ? (
              <CheckCircle className="text-emerald-400" size={24} />
            ) : (
              <Activity className="text-blue-400" size={24} />
            )}
            <div>
              <p className="text-white font-medium text-sm">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
