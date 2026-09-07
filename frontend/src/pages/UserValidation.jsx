import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Star, UserCheck, Send, ThumbsUp, ShieldCheck } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function UserValidation() {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('DB Engineer');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchValidation();
  }, []);

  async function fetchValidation() {
    try {
      const res = await axios.get(`${API_BASE}/user-validation`);
      setValidation(res.data);
    } catch (err) {
      console.error("Failed to fetch user validation", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/user-validation`, { role, author, rating, comment });
      setAuthor('');
      setComment('');
      await fetchValidation();
    } catch (err) {
      console.error("Failed to submit feedback", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div className="animate-in fade-in duration-500 text-gray-200">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight flex flex-wrap items-center gap-3 text-white">
              <MessageSquare className="text-blue-400 shrink-0" size={36} />
              <span>User Validation & Expert Feedback</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm md:text-lg">
              Qualitative feedback and satisfaction ratings collected from DB Administrators, DB Engineers, and VP Tech stakeholders.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-amber-400 flex items-center gap-1 font-mono">
                {validation.average_rating} <Star size={24} className="fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Average Satisfaction</div>
            </div>
            <div className="border-l border-white/10 pl-4 text-center">
              <div className="text-3xl font-extrabold text-white font-mono">{validation.total_reviews}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-mono">Verified Reviews</div>
            </div>
          </div>
        </div>
      </header>

      {/* Submission Form */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl mb-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Send size={20} className="text-blue-400" /> Submit Expert Validation & Review
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Your Name / Title</label>
              <input 
                type="text" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)} 
                placeholder="e.g. Jordan Smith" 
                required 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Role / Specialization</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="DB Engineer">DB Engineer</option>
                <option value="Database Administrator">Database Administrator</option>
                <option value="Stakeholder">Stakeholder / Executive</option>
                <option value="Performance Engineer">Performance Engineer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Rating (1 to 5 Stars)</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value={5}>5 Stars (Excellent)</option>
                <option value={4}>4 Stars (Good)</option>
                <option value={3}>3 Stars (Average)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Validation Comments & Remarks</label>
            <textarea 
              rows={3} 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share insights on ML accuracy, execution plan comparison usability, or performance impact..."
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Post Validation Review'}
          </button>
        </form>
      </div>

      {/* Feedbacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validation.feedbacks.map((item) => (
          <div 
            key={item.id}
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 font-bold">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{item.author}</h4>
                  <span className="text-xs text-gray-400 font-mono">{item.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                {item.rating} <Star size={16} className="fill-amber-400" />
              </div>
            </div>

            <p className="text-gray-300 text-sm italic mb-4 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
              "{item.comment}"
            </p>

            <div className="text-xs text-gray-500 font-mono text-right">
              Validated: {item.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
