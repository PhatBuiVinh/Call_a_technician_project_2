import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Shell from '../components/Shell';

export default function TechDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await api('/my-jobs');
      setJobs(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Assigned': return 'bg-blue-500/20 text-blue-300';
      case 'Accepted': return 'bg-purple-500/20 text-purple-300';
      case 'En Route': return 'bg-yellow-500/20 text-yellow-300';
      case 'On Site': return 'bg-orange-500/20 text-orange-300';
      case 'In Progress': return 'bg-pink-500/20 text-pink-300';
      case 'Completed': return 'bg-green-500/20 text-green-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  }

  return (
    <Shell title="My Jobs">
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12 text-slate-400">Loading jobs...</div>
        )}
        
        {error && (
          <div className="p-4 bg-rose-500/20 text-rose-300 rounded-xl">
            {error}
          </div>
        )}
        
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">📋</div>
            <p>No jobs assigned to you yet.</p>
          </div>
        )}
        
        {!loading && jobs.length > 0 && (
          <div className="grid gap-3">
            {jobs.map(job => (
              <div
                key={job._id}
                onClick={() => nav(`/tech-view/job/${job._id}`)}
                className="surface p-4 rounded-xl cursor-pointer hover:bg-white/5 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{job.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span className="truncate">{job.customerName || 'No customer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="truncate">{job.customerAddress || 'No address'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>{formatDate(job.startAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🧾</span>
                        <span>{job.invoice || '-'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-slate-500 group-hover:text-slate-300 transition">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
