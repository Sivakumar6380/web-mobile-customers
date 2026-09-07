import React from 'react';

export default function DashboardCard({ title, value, icon, color }) {
  return (
    <div className="relative group overflow-hidden bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl transition-all duration-300 hover:border-white/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 flex items-center justify-between">
      {/* Subtle Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-20 transition duration-500 blur-xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-gray-300 text-sm font-medium tracking-wide uppercase mb-2">{title}</h3>
        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">{value}</p>
      </div>
      
      <div className={`relative z-10 p-4 rounded-2xl ${color} shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
    </div>
  );
}
