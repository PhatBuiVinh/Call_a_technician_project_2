import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Shell from '../components/Shell';

// Status badge configuration with icons and colors
const STATUS_CONFIG = {
  'Assigned': { icon: '📋', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', accent: 'blue' },
  'Accepted': { icon: '👍', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', accent: 'indigo' },
  'En Route': { icon: '🚗', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', accent: 'amber' },
  'On Site': { icon: '📍', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', accent: 'orange' },
  'In Progress': { icon: '🔧', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40', accent: 'fuchsia' },
  'Completed': { icon: '✓', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', accent: 'emerald' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Assigned'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${config.color}`}>
      <span>{config.icon}</span>
      <span>{status}</span>
    </span>
  );
}

function StatCard({ label, value, accent = 'default' }) {
  const accents = {
    default: 'from-white/5 to-white/[0.02] border-white/10',
    blue: 'from-brand-blue/10 to-brand-blue/[0.02] border-brand-blue/20',
    emerald: 'from-brand-teal/10 to-brand-teal/[0.02] border-brand-teal/20',
  };

  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${accents[accent]} border shadow-soft`}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function JobCard({ job, onClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG['Assigned'];

  return (
    <div 
      onClick={onClick}
      className="group bg-brand-panel rounded-2xl border border-brand-border p-4 shadow-soft 
                 hover:border-brand-sky/30 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Header: Status + Title */}
      <div className="flex flex-col gap-2 mb-4">
        <StatusBadge status={job.status} />
        <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-brand-sky transition-colors">
          {job.title}
        </h3>
      </div>

      {/* Customer Info Block */}
      <div className="space-y-3 mb-4">
        {/* Customer Name */}
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">👤</span>
          <div className="min-w-0">
            <p className="text-sm text-slate-400">Customer</p>
            <p className="text-white font-medium truncate">{job.customerName || 'Not provided'}</p>
          </div>
        </div>

        {/* Address - Prominent for field use */}
        {job.customerAddress && (
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">📍</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-400">Address</p>
              <p className="text-slate-200 text-sm leading-relaxed">{job.customerAddress}</p>
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">🕐</span>
          <div className="min-w-0">
            <p className="text-sm text-slate-400">Scheduled</p>
            <p className="text-slate-200 text-sm">{formatDate(job.startAt)}</p>
          </div>
        </div>

        {/* Phone - Quick action if available */}
        {job.phone && (
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">📞</span>
              <div className="min-w-0">
                <p className="text-sm text-slate-400">Contact</p>
                <p className="text-white font-medium">{job.phone}</p>
              </div>
            </div>
            <a 
              href={`tel:${job.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 px-4 py-2 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-sky 
                       rounded-xl font-medium text-sm border border-brand-blue/30 transition-colors"
            >
              Call
            </a>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200
                   ${config.color} hover:brightness-110 active:scale-[0.98]`}
      >
        Open Job Details →
      </button>
    </div>
  );
}

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

  const activeJobs = jobs.filter((job) => job.status !== 'Completed').length;
  const completedJobs = jobs.filter((job) => job.status === 'Completed').length;
  const inProgressJobs = jobs.filter((job) => job.status === 'In Progress').length;

  return (
    <Shell title="My Jobs" subtitle="Assigned work and current progress">
      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <span className="text-3xl animate-pulse">⏳</span>
            <p>Loading your jobs...</p>
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
            <p className="text-lg font-medium text-white">No jobs assigned yet</p>
            <p className="text-sm text-slate-400 mt-2">New assignments will appear here automatically.</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total" value={jobs.length} accent="default" />
              <StatCard label="Active" value={activeJobs} accent="blue" />
              <StatCard label="Done" value={completedJobs} accent="emerald" />
            </div>

            {/* In Progress Indicator */}
            {inProgressJobs > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
                <p className="text-sm text-fuchsia-200">
                  <span className="font-semibold">{inProgressJobs}</span> job{inProgressJobs !== 1 ? 's' : ''} in progress
                </p>
              </div>
            )}

            {/* Job Cards */}
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  onClick={() => nav(`/tech-view/job/${job._id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
