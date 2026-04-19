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
      case 'Assigned': return 'bg-blue-500/20 text-blue-200 border border-blue-400/40';
      case 'Accepted': return 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/40';
      case 'En Route': return 'bg-amber-500/20 text-amber-200 border border-amber-400/40';
      case 'On Site': return 'bg-orange-500/20 text-orange-200 border border-orange-400/40';
      case 'In Progress': return 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/40';
      case 'Completed': return 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40';
      default: return 'bg-slate-500/20 text-slate-200 border border-slate-400/40';
    }
  }

  const activeJobs = jobs.filter((job) => job.status !== 'Completed').length;
  const completedJobs = jobs.filter((job) => job.status === 'Completed').length;
  const inProgressJobs = jobs.filter((job) => job.status === 'In Progress').length;

  return (
    <Shell title="My Jobs" subtitle="Assigned work and current progress">
      <div className="space-y-5">
        {loading && (
          <div className="text-center py-16 text-slate-400">Loading jobs...</div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="surface p-10 rounded-xl text-center text-slate-300">
            <p className="text-lg font-medium">No jobs assigned yet</p>
            <p className="text-sm text-slate-400 mt-2">New assignments will appear here automatically.</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="surface p-4 rounded-xl">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total Assigned</p>
                <p className="text-2xl font-semibold mt-1">{jobs.length}</p>
              </div>
              <div className="surface p-4 rounded-xl">
                <p className="text-xs uppercase tracking-wide text-slate-400">Active Jobs</p>
                <p className="text-2xl font-semibold mt-1">{activeJobs}</p>
              </div>
              <div className="surface p-4 rounded-xl">
                <p className="text-xs uppercase tracking-wide text-slate-400">Completed</p>
                <p className="text-2xl font-semibold mt-1">{completedJobs}</p>
              </div>
            </div>

            <div className="surface rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
                <h2 className="font-semibold">Work Queue</h2>
                <span className="text-sm text-slate-400">In Progress: {inProgressJobs}</span>
              </div>

              <div className="divide-y divide-white/10">
                {jobs.map(job => (
                  <button
                    key={job._id}
                    onClick={() => nav(`/tech-view/job/${job._id}`)}
                    className="w-full text-left px-4 py-4 hover:bg-white/5 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-medium truncate">{job.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-slate-500">Customer</p>
                            <p className="text-slate-300 truncate">{job.customerName || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Scheduled</p>
                            <p className="text-slate-300">{formatDate(job.startAt)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Invoice</p>
                            <p className="text-slate-300">{job.invoice || 'Not assigned'}</p>
                          </div>
                        </div>

                        {job.customerAddress && (
                          <p className="text-sm text-slate-400 truncate mt-2">
                            {job.customerAddress}
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 self-center">View</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
