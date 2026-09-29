import React from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an unhandled rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-8 shadow-2xl shadow-rose-950/40 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
              <AlertOctagon size={36} />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Application Interface Encountered an Error</h1>
            <p className="text-slate-400 text-sm mb-6">
              A UI rendering boundary intercepted an unexpected error. Database operations and telemetry background streams remain operational.
            </p>

            {this.state.error && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-left font-mono text-xs text-rose-300 mb-6 overflow-x-auto max-h-40">
                <span className="text-slate-500 block mb-1 font-bold uppercase tracking-wider">Exception Trace</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/20"
              >
                <RotateCcw size={16} /> Reload Module
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
              >
                <Home size={16} /> Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
