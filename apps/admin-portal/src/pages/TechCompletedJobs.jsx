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
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <span className="text-3xl animate-pulse">⏳</span>
            <p>Loading your completed jobs...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-xl">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="bg-brand-panel rounded-2xl border border-brand-border p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium text-white">No completed jobs yet</p>
            <p className="text-sm text-slate-400 mt-2">
              Completed jobs will appear here after you finish them.
            </p>
            <button
              onClick={() => nav('/tech-view')}
              className="mt-6 px-4 py-2 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-sky rounded-xl font-medium transition-colors"
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border bg-brand-teal/20 text-brand-teal border-brand-teal/40">
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
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span>⚠️</span>
                        <span>Follow-up Required</span>
                      </span>
                    )}
                    {job.completionPhotos?.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-brand-blue/20 text-brand-sky border border-brand-blue/30">
                        <span>📷</span>
                        <span>{job.completionPhotos.length} photo{job.completionPhotos.length !== 1 ? 's' : ''}</span>
                      </span>
                    )}
                    {job.completionForm?.partsUsed && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-slate-300 border border-white/10">
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
