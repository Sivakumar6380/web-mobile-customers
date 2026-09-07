import React from 'react';
import { ArrowRight, Database, Search, FileText, Bell, BarChart2 } from 'lucide-react';

export default function LegacyWorkflow() {
  const steps = [
    { icon: <Database size={32} />, title: 'Old Monitoring', desc: 'Legacy telemetry collection', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    { icon: <Search size={32} />, title: 'Regression Detector', desc: 'ML-based analysis layer', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: <FileText size={32} />, title: 'Evidence Collection', desc: 'Query plans & schema diffs', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: <Bell size={32} />, title: 'Smart Alerts', desc: 'Context-aware notifications', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { icon: <BarChart2 size={32} />, title: 'Stakeholder Reports', desc: 'Business impact summaries', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight">Migration & Coexistence</h2>
        <p className="text-gray-400 mt-3 text-lg">Visualizing the integration of the new Regression Detector with legacy monitoring systems.</p>
      </header>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-20 relative px-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className={`relative flex-1 bg-white/5 backdrop-blur-md rounded-2xl border p-6 flex flex-col items-center text-center shadow-xl z-10 hover:-translate-y-2 transition-transform duration-300 ${step.bg}`}>
              <div className={`mb-4 p-4 rounded-full bg-black/40 ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </div>
            
            {index < steps.length - 1 && (
              <div className="hidden lg:flex items-center text-gray-500 mx-2 animate-pulse">
                <ArrowRight size={32} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-20 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-md text-center max-w-3xl mx-auto shadow-2xl shadow-blue-500/10">
        <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Seamless Integration</h3>
        <p className="text-gray-300 text-lg">
          The new NexusDB Guardian operates in parallel with legacy systems, ensuring zero downtime while providing advanced AI-driven insights that legacy tools miss.
        </p>
      </div>
    </div>
  );
}
