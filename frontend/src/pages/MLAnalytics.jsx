import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MLAnalytics() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.get('http://localhost:5000/api/reports/model-evaluation');
        setReport(res.data);
      } catch (err) {
        setError("Could not load ML evaluation report.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (error) return <div className="text-red-400 font-bold p-8">{error}</div>;

  const iso = report.Metrics.Isolation_Forest;
  const rf = report.Metrics.Random_Forest;

  const barData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC AUC'],
    datasets: [
      {
        label: 'Isolation Forest (Unsupervised)',
        data: [iso.Accuracy, iso.Precision, iso.Recall, iso.F1_Score, iso.ROC_AUC],
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return 'rgba(251, 191, 36, 0.5)';
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(217, 119, 6, 0.2)');   // Dark amber base
          gradient.addColorStop(1, 'rgba(252, 211, 77, 0.9)'); // Bright gold top
          return gradient;
        },
        borderColor: '#fbbf24', // Amber 400
        borderWidth: 1,
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
        hoverBackgroundColor: '#fcd34d'
      },
      {
        label: 'Random Forest (Supervised)',
        data: [rf.Accuracy, rf.Precision, rf.Recall, rf.F1_Score, rf.ROC_AUC],
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return 'rgba(139, 92, 246, 0.5)';
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');   // Deep indigo base
          gradient.addColorStop(1, 'rgba(167, 139, 250, 0.9)'); // Vibrant violet top
          return gradient;
        },
        borderColor: '#a78bfa', // Violet 400
        borderWidth: 1,
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
        hoverBackgroundColor: '#c4b5fd'
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e5e7eb' } }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' }, max: 1.0 },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
    }
  };

  const ConfusionMatrix = ({ title, data, color }) => (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <h3 className={`text-lg font-bold mb-4 ${color}`}>{title} Confusion Matrix</h3>
      <div className="grid grid-cols-2 gap-2 text-center text-sm font-mono">
        <div className="bg-green-500/20 text-green-400 p-4 rounded-lg border border-green-500/30">
          <div className="text-2xs uppercase tracking-widest text-gray-500 mb-1">True Negative</div>
          <div className="text-2xl font-bold">{data.TN}</div>
        </div>
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg border border-red-500/30">
          <div className="text-2xs uppercase tracking-widest text-gray-500 mb-1">False Positive</div>
          <div className="text-2xl font-bold">{data.FP}</div>
        </div>
        <div className="bg-yellow-500/20 text-yellow-400 p-4 rounded-lg border border-yellow-500/30">
          <div className="text-2xs uppercase tracking-widest text-gray-500 mb-1">False Negative</div>
          <div className="text-2xl font-bold">{data.FN}</div>
        </div>
        <div className="bg-blue-500/20 text-blue-400 p-4 rounded-lg border border-blue-500/30">
          <div className="text-2xs uppercase tracking-widest text-gray-500 mb-1">True Positive</div>
          <div className="text-2xl font-bold">{data.TP}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <BrainCircuit className="text-indigo-400" size={36} /> Machine Learning Intelligence
        </h2>
        <p className="text-gray-400 mt-3 text-lg">Evaluation and selection of models used for regression detection.</p>
      </header>

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-10 flex gap-4 items-start shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <div className="p-3 bg-indigo-500/20 rounded-full shrink-0">
          <AlertCircle className="text-indigo-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-indigo-300 mb-2">Automated Model Selection</h3>
          <p className="text-gray-300 leading-relaxed">
            {report.Explanation} The system is currently actively using <strong>{report.Best_Model.replace('_', ' ')}</strong> in production.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl h-96">
          <h3 className="text-lg font-bold mb-6">Model Performance Comparison</h3>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className="flex flex-col gap-8">
          <ConfusionMatrix title="Random Forest" data={rf.Confusion_Matrix} color="text-blue-400" />
          <ConfusionMatrix title="Isolation Forest" data={iso.Confusion_Matrix} color="text-yellow-400" />
        </div>
      </div>
    </div>
  );
}
