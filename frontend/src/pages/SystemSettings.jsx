import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Sliders, Cpu, HardDrive, AlertOctagon, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await axios.get(`${API_BASE}/settings`);
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/settings`, settings);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight flex flex-wrap items-center gap-3 text-white">
          <Settings className="text-gray-400 shrink-0" size={36} />
          <span>System Alert & ML Detection Settings</span>
        </h2>
        <p className="text-gray-400 mt-2 text-sm md:text-lg">
          Configure detection sensitivity thresholds, CPU/Memory resource triggers, and confidence boundaries.
        </p>
      </header>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={20} /> Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders size={20} className="text-blue-400" /> Regression Detection Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Execution Time Regression Threshold (%)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={settings.regression_threshold_pct} 
                  onChange={(e) => setSettings({ ...settings, regression_threshold_pct: Number(e.target.value) })}
                  className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 w-full"
                />
                <span className="text-gray-400 font-mono text-sm">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Queries exceeding baseline by this percentage trigger an alert.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                ML Confidence Threshold (%)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={settings.confidence_threshold_pct} 
                  onChange={(e) => setSettings({ ...settings, confidence_threshold_pct: Number(e.target.value) })}
                  className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 w-full"
                />
                <span className="text-gray-400 font-mono text-sm">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum model prediction confidence required to flag regressions automatically.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Cpu size={20} className="text-emerald-400" /> Resource Trigger Limits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                CPU Spike Warning Threshold (%)
              </label>
              <input 
                type="number" 
                value={settings.cpu_threshold_pct} 
                onChange={(e) => setSettings({ ...settings, cpu_threshold_pct: Number(e.target.value) })}
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Alerts triggered when database node CPU utilization exceeds this value.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Memory Spike Warning Threshold (MB)
              </label>
              <input 
                type="number" 
                value={settings.memory_threshold_mb} 
                onChange={(e) => setSettings({ ...settings, memory_threshold_mb: Number(e.target.value) })}
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Buffer pool and query execution context allocation limit.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Save size={18} />
            {saving ? 'Saving Settings...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
