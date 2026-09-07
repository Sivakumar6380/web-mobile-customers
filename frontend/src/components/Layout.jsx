import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Database, LayoutDashboard, TrendingUp, Users, BrainCircuit, AlertTriangle, 
  TableProperties, RotateCcw, GitMerge, BarChart, GitCommit, Layers, 
  Activity, Bell, FileText, CheckSquare, MessageSquare, Settings, SlidersHorizontal,
  LogOut, User, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
      isActive 
        ? 'bg-gradient-to-r from-blue-600/80 to-indigo-600/80 text-white shadow-lg shadow-blue-500/25 border border-white/10' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
    }`;
  };

  const role = user?.role || 'Guest';

  return (
    <div className="h-screen flex flex-col text-white font-sans bg-gradient-to-br from-gray-950 via-slate-900 to-black overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-8 py-4 bg-black/30 backdrop-blur-xl border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg shadow-lg">
            <Database className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Nexus<span className="text-blue-400">DB</span> Guardian
          </h1>
        </div>

        {/* User Account Controls */}
        {user && (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{user.role}</div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition-all cursor-pointer"
              title="Logout session"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </header>
      
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col z-10 hidden md:flex shadow-2xl overflow-y-auto max-h-full">
          <div className="p-5 space-y-6">

            {/* ADMINISTRATOR ROLE MENU */}
            {role === 'Administrator' && (
              <>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-3 px-2">Dashboards</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/admin" className={getLinkClass('/admin')}>
                      <LayoutDashboard size={18} className="shrink-0" /> Admin Overview
                    </Link>
                    <Link to="/engineer" className={getLinkClass('/engineer')}>
                      <TrendingUp size={18} className="shrink-0" /> DB Engineer View
                    </Link>
                    <Link to="/stakeholder" className={getLinkClass('/stakeholder')}>
                      <Users size={18} className="shrink-0" /> Stakeholder View
                    </Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-3 px-2">Intelligence & Data</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/regressions" className={getLinkClass('/regressions')}>
                      <AlertTriangle size={18} className="shrink-0 text-red-400" /> Critical Alerts
                    </Link>
                    <Link to="/dataset" className={getLinkClass('/dataset')}>
                      <TableProperties size={18} className="shrink-0 text-emerald-400" /> Full Dataset
                    </Link>
                    <Link to="/plan-comparison" className={getLinkClass('/plan-comparison')}>
                      <GitCommit size={18} className="shrink-0 text-cyan-400" /> Plan Comparison
                    </Link>
                    <Link to="/ml-analytics" className={getLinkClass('/ml-analytics')}>
                      <BrainCircuit size={18} className="shrink-0 text-indigo-400" /> ML Analytics
                    </Link>
                    <Link to="/baseline" className={getLinkClass('/baseline')}>
                      <BarChart size={18} className="shrink-0 text-blue-400" /> Baseline Analysis
                    </Link>
                    <Link to="/release-history" className={getLinkClass('/release-history')}>
                      <GitMerge size={18} className="shrink-0 text-purple-400" /> Release History
                    </Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-3 px-2">Schema & Optimization</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/schema-comparison" className={getLinkClass('/schema-comparison')}>
                      <Layers size={18} className="shrink-0 text-teal-400" /> Schema Comparison
                    </Link>
                    <Link to="/index-analysis" className={getLinkClass('/index-analysis')}>
                      <SlidersHorizontal size={18} className="shrink-0 text-yellow-400" /> Index Analysis
                    </Link>
                    <Link to="/statistics-analysis" className={getLinkClass('/statistics-analysis')}>
                      <Activity size={18} className="shrink-0 text-rose-400" /> Statistics Analysis
                    </Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-3 px-2">Operations & System</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/alerts" className={getLinkClass('/alerts')}>
                      <Bell size={18} className="shrink-0 text-orange-400" /> System Alerts
                    </Link>
                    <Link to="/legacy-workflow" className={getLinkClass('/legacy-workflow')}>
                      <GitMerge size={18} className="shrink-0 text-gray-400" /> Legacy Workflow
                    </Link>
                    <Link to="/rollback" className={getLinkClass('/rollback')}>
                      <RotateCcw size={18} className="shrink-0 text-red-400" /> System Rollback
                    </Link>
                    <Link to="/reports" className={getLinkClass('/reports')}>
                      <FileText size={18} className="shrink-0 text-amber-400" /> Download Reports
                    </Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-3 px-2">Quality & Security Admin</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/testing" className={getLinkClass('/testing')}>
                      <CheckSquare size={18} className="shrink-0 text-emerald-400" /> Test Suite
                    </Link>
                    <Link to="/validation" className={getLinkClass('/validation')}>
                      <MessageSquare size={18} className="shrink-0 text-blue-400" /> User Validation
                    </Link>
                    <Link to="/users" className={getLinkClass('/users')}>
                      <Users size={18} className="shrink-0 text-purple-400" /> User Management
                    </Link>
                    <Link to="/audit-logs" className={getLinkClass('/audit-logs')}>
                      <ShieldCheck size={18} className="shrink-0 text-indigo-400" /> Audit Logs
                    </Link>
                    <Link to="/settings" className={getLinkClass('/settings')}>
                      <Settings size={18} className="shrink-0 text-gray-400" /> System Settings
                    </Link>
                  </nav>
                </div>
              </>
            )}

            {/* DATABASE ENGINEER ROLE MENU */}
            {role === 'Database Engineer' && (
              <>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-3 px-2">Technical Console</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/engineer" className={getLinkClass('/engineer')}>
                      <TrendingUp size={18} className="shrink-0 text-cyan-400" /> Technical Dashboard
                    </Link>
                    <Link to="/dataset" className={getLinkClass('/dataset')}>
                      <TableProperties size={18} className="shrink-0 text-emerald-400" /> Query Monitoring
                    </Link>
                    <Link to="/regressions" className={getLinkClass('/regressions')}>
                      <AlertTriangle size={18} className="shrink-0 text-red-400" /> Query Regression Detector
                    </Link>
                    <Link to="/plan-comparison" className={getLinkClass('/plan-comparison')}>
                      <GitCommit size={18} className="shrink-0 text-cyan-400" /> Plan Comparison
                    </Link>
                    <Link to="/evidence/0" className={getLinkClass('/evidence')}>
                      <FileText size={18} className="shrink-0 text-indigo-400" /> Evidence & Root Cause
                    </Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-3 px-2">Performance & Schema</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/index-analysis" className={getLinkClass('/index-analysis')}>
                      <SlidersHorizontal size={18} className="shrink-0 text-yellow-400" /> Index Analysis
                    </Link>
                    <Link to="/statistics-analysis" className={getLinkClass('/statistics-analysis')}>
                      <Activity size={18} className="shrink-0 text-rose-400" /> Statistics Analysis
                    </Link>
                    <Link to="/schema-comparison" className={getLinkClass('/schema-comparison')}>
                      <Layers size={18} className="shrink-0 text-teal-400" /> Schema Changes
                    </Link>
                    <Link to="/baseline" className={getLinkClass('/baseline')}>
                      <BarChart size={18} className="shrink-0 text-blue-400" /> Baseline Metrics
                    </Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-3 px-2">Alerting & Reports</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/alerts" className={getLinkClass('/alerts')}>
                      <Bell size={18} className="shrink-0 text-orange-400" /> System Alerts
                    </Link>
                    <Link to="/reports" className={getLinkClass('/reports')}>
                      <FileText size={18} className="shrink-0 text-amber-400" /> Export Reports
                    </Link>
                    <Link to="/profile" className={getLinkClass('/profile')}>
                      <User size={18} className="shrink-0 text-gray-400" /> User Profile
                    </Link>
                  </nav>
                </div>
              </>
            )}

            {/* STAKEHOLDER ROLE MENU */}
            {role === 'Stakeholder' && (
              <>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-3 px-2">Executive Views</h3>
                  <nav className="flex flex-col gap-1.5">
                    <Link to="/stakeholder" className={getLinkClass('/stakeholder')}>
                      <Users size={18} className="shrink-0 text-emerald-400" /> Executive Summary
                    </Link>
                    <Link to="/release-history" className={getLinkClass('/release-history')}>
                      <GitMerge size={18} className="shrink-0 text-purple-400" /> Release Summary
                    </Link>
                    <Link to="/alerts" className={getLinkClass('/alerts')}>
                      <Bell size={18} className="shrink-0 text-orange-400" /> Alerts Summary
                    </Link>
                    <Link to="/reports" className={getLinkClass('/reports')}>
                      <FileText size={18} className="shrink-0 text-amber-400" /> Monthly Reports
                    </Link>
                    <Link to="/validation" className={getLinkClass('/validation')}>
                      <MessageSquare size={18} className="shrink-0 text-blue-400" /> Feedback & Validation
                    </Link>
                    <Link to="/profile" className={getLinkClass('/profile')}>
                      <User size={18} className="shrink-0 text-gray-400" /> User Profile
                    </Link>
                  </nav>
                </div>
              </>
            )}

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto relative z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
