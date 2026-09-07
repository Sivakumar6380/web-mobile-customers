import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, PlusCircle, MinusCircle, Edit3, Key, Link as LinkIcon, Database, ArrowRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function SchemaComparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await axios.get(`${API_BASE}/schema-comparison`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch schema comparison", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
              <Layers className="text-teal-400" size={36} /> Schema Comparison & Drift Analysis
            </h2>
            <p className="text-gray-400 mt-2 text-lg">
              Compare DDL changes, added/dropped tables, column data type mutations, and index modifications.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl font-mono text-sm">
            <span className="text-emerald-400 font-bold">{data.before_version}</span>
            <ArrowRight size={18} className="text-gray-400" />
            <span className="text-teal-400 font-bold">{data.after_version}</span>
          </div>
        </div>
      </header>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-950/20 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2">
              <PlusCircle size={20} /> Added Tables ({data.added_tables.length})
            </h3>
          </div>
          <div className="space-y-3">
            {data.added_tables.map((tbl, i) => (
              <div key={i} className="bg-black/40 p-3.5 rounded-xl border border-emerald-500/20 font-mono text-xs">
                <div className="text-white font-bold mb-1">{tbl.table_name}</div>
                <div className="text-gray-400 flex justify-between">
                  <span>Columns: {tbl.columns}</span>
                  <span className="text-emerald-300">PK: {tbl.primary_key}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-950/20 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-red-400 flex items-center gap-2">
              <MinusCircle size={20} /> Deleted Tables ({data.deleted_tables.length})
            </h3>
          </div>
          <div className="space-y-3">
            {data.deleted_tables.map((tbl, i) => (
              <div key={i} className="bg-black/40 p-3.5 rounded-xl border border-red-500/20 font-mono text-xs">
                <div className="text-white font-bold mb-1">{tbl.table_name}</div>
                <div className="text-red-300">{tbl.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-teal-950/20 backdrop-blur-md rounded-2xl border border-teal-500/30 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-teal-400 flex items-center gap-2">
              <Edit3 size={20} /> Modified Columns ({data.modified_columns.length})
            </h3>
          </div>
          <div className="space-y-3">
            {data.modified_columns.map((col, i) => (
              <div key={i} className="bg-black/40 p-3.5 rounded-xl border border-teal-500/20 font-mono text-xs">
                <div className="text-white font-bold">{col.table}.{col.column}</div>
                <div className="text-gray-400 mt-1 flex items-center gap-1.5">
                  <span className="text-red-300">{col.before}</span>
                  <span>&rarr;</span>
                  <span className="text-emerald-300">{col.after}</span>
                </div>
                <div className="text-teal-300 text-[11px] mt-1 italic">{col.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Constraints and Indexes Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Key className="text-amber-400" size={22} /> Key Constraints Alterations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-3">Table</th>
                  <th className="pb-3">PK Before</th>
                  <th className="pb-3">PK After</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.primary_keys.map((pk, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-3 text-white font-bold">{pk.table}</td>
                    <td className="py-3 text-red-300">{pk.pk_before}</td>
                    <td className="py-3 text-emerald-300">{pk.pk_after}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {pk.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="text-cyan-400" size={22} /> Index Modifications
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-3">Index Name</th>
                  <th className="pb-3">Table</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.indexes.map((idx, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-3 text-cyan-300 font-bold">{idx.index_name}</td>
                    <td className="py-3 text-gray-300">{idx.table}</td>
                    <td className="py-3 text-gray-400">{idx.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded border ${
                        idx.status === 'Added' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {idx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
