import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Shell from '../components/Shell';

export default function TechCompletedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    loadCompletedJobs();
  }, []);

  async function loadCompletedJobs() {
    try {
      setLoading(true);
      const data = await api('/my-jobs');
      // Filter only completed jobs
      const completedJobs = (data || []).filter(job => job.status === 'Completed');
      setJobs(completedJobs);
    } catch (err) {
      setError(err?.message || 'Failed to load completed jobs');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const jobsWithFollowUp = jobs.filter(job => job.completionForm?.followUpRequired).length;
  const jobsWithPhotos = jobs.filter(job => job.completionPhotos?.length > 0).length;
  const totalJobs = jobs.length;

  return (
    <Shell title="Completed Jobs" subtitle="Your completed work history">
      <div className="space-y-6">
        {loading && (
          <div className="surface rounded-2xl border-brand-sky/20 bg-brand-sky/10 p-8 text-center">
            <span className="text-3xl animate-pulse">⏳</span>
            <h2 className="mt-3 text-lg font-semibold text-white">Loading completed jobs</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Loading your completed jobs...</p>
          </div>
        )}

        {error && (
          <div className="surface rounded-2xl border-rose-400/35 bg-rose-500/10 p-6 text-center">
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-rose-300/70" />
            <h2 className="text-lg font-semibold text-white">Completed jobs could not load</h2>
            <p className="mt-2 text-sm leading-6 text-rose-100">
              <span className="font-medium">Error:</span> {error}
            </p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="surface rounded-2xl border-white/10 bg-white/[0.04] p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-semibold text-white">No completed jobs yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Completed jobs will appear here after you finish them.
            </p>
            <button
              onClick={() => nav('/tech-view')}
              className="btn btn-ghost mt-6"
            >
              Go to My Jobs
            </button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-brand-teal/10 to-brand-teal/[0.02] border border-brand-teal/20 shadow-soft">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">{totalJobs}</p>
              </div>
              <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20 shadow-soft">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Follow-ups</p>
                <p className="text-3xl font-bold text-amber-300 mt-1">{jobsWithFollowUp}</p>
              </div>
              <div className="rounded-2xl p-4 bg-gradient-to-br from-brand-blue/10 to-brand-blue/[0.02] border border-brand-blue/20 shadow-soft">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">With Photos</p>
                <p className="text-3xl font-bold text-brand-sky mt-1">{jobsWithPhotos}</p>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {jobs.map(job => (
                <div
                  key={job._id}
                  onClick={() => nav(`/tech-view/job/${job._id}`)}
                  className="group bg-brand-panel rounded-2xl border border-brand-border p-4 shadow-soft
                           hover:border-brand-teal/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <span className="badge badge-lg badge-emerald">
                        <span>✓</span>
                        <span>Completed</span>
                      </span>
                      <h3 className="font-semibold text-white text-lg leading-tight mt-2 group-hover:text-brand-teal transition-colors">
                        {job.title}
                      </h3>
                    </div>
                    <span className="text-sm text-slate-400 shrink-0">
                      {formatDate(job.completedAt || job.completionForm?.submittedAt)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">👤</span>
                      <span className="text-slate-300">{job.customerName || 'No customer name'}</span>
                    </div>
                    {job.customerAddress && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-slate-400 shrink-0">📍</span>
                        <span className="text-slate-300 line-clamp-2">{job.customerAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Completion Summary Preview */}
                  {job.completionForm && (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Completion Summary</p>
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {job.completionForm.workPerformed || 'No work description'}
                      </p>
                    </div>
                  )}

                  {/* Indicators */}
                  <div className="flex flex-wrap items-center gap-2">
                    {job.completionForm?.followUpRequired && (
                      <span className="badge badge-amber">
                        <span>⚠️</span>
                        <span>Follow-up Required</span>
                      </span>
                    )}
                    {job.completionPhotos?.length > 0 && (
                      <span className="badge badge-blue">
                        <span>📷</span>
                        <span>{job.completionPhotos.length} photo{job.completionPhotos.length !== 1 ? 's' : ''}</span>
                      </span>
                    )}
                    {job.completionForm?.partsUsed && (
                      <span className="badge badge-neutral">
                        <span>🔧</span>
                        <span>Parts recorded</span>
                      </span>
                    )}
                  </div>

                  {/* View Button */}
                  <button className="w-full mt-4 py-3 rounded-xl font-medium text-sm bg-brand-teal/20 text-brand-teal border border-brand-teal/30 hover:bg-brand-teal/30 transition-all duration-200">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
