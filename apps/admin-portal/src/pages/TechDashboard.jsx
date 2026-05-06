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
    <span className={`badge badge-lg ${getStatusBadgeClass(status)}`}>
      <span>{config.icon}</span>
      <span>{status}</span>
    </span>
  );
}

function getStatusBadgeClass(status) {
  const styles = {
    'Assigned': 'badge-blue',
    'Accepted': 'badge-sky',
    'En Route': 'badge-amber',
    'On Site': 'badge-orange',
    'In Progress': 'badge-fuchsia',
    'Completed': 'badge-emerald',
  };

  return styles[status] || 'badge-blue';
}

function getStatusActionClass(status) {
  const styles = {
    'Assigned': 'bg-blue-500/20 text-blue-200 border border-blue-400/35',
    'Accepted': 'bg-sky-500/20 text-sky-200 border border-sky-400/35',
    'En Route': 'bg-amber-500/20 text-amber-200 border border-amber-400/35',
    'On Site': 'bg-orange-500/20 text-orange-200 border border-orange-400/35',
    'In Progress': 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/35',
    'Completed': 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/35',
  };

  return styles[status] || styles.Assigned;
}

function getPriorityBadgeClass(priority) {
  const styles = {
    Low: 'badge-slate',
    Medium: 'badge-amber',
    High: 'badge-orange',
    Urgent: 'badge-rose',
  };

  return styles[priority] || 'badge-slate';
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

  return (
    <div 
      onClick={onClick}
      className="group surface rounded-2xl p-4 sm:p-5 hover:border-brand-sky/35 hover:bg-white/[0.07] hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Header: Status + Title */}
      <div className="mb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={job.status} />
          {job.priority && (
            <span className={`badge ${getPriorityBadgeClass(job.priority)}`}>
              {job.priority}
            </span>
          )}
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight group-hover:text-brand-sky transition-colors">
          {job.title || 'Untitled job'}
        </h3>
      </div>

      {/* Customer Info Block */}
      <div className="grid gap-3 mb-4 sm:grid-cols-2">
        {/* Customer Name */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-start gap-3">
          <span className="text-xl shrink-0">👤</span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Customer</p>
            <p className="mt-1 text-white font-semibold truncate">{job.customerName || 'Not provided'}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-start gap-3">
          <span className="text-xl shrink-0">🕐</span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Scheduled</p>
            <p className="mt-1 text-slate-200 text-sm font-medium">{formatDate(job.startAt)}</p>
          </div>
        </div>

        {/* Address - Prominent for field use */}
        {job.customerAddress && (
          <div className="rounded-xl border border-brand-sky/20 bg-brand-blue/10 p-3 flex items-start gap-3 sm:col-span-2">
            <span className="text-xl shrink-0">📍</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Service Address</p>
              <p className="mt-1 text-slate-100 text-sm leading-relaxed">{job.customerAddress}</p>
            </div>
          </div>
        )}

        {/* Phone - Quick action if available */}
        {job.phone && (
          <div className="flex flex-col gap-3 pt-3 border-t border-white/10 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">📞</span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact</p>
                <p className="text-white font-semibold">{job.phone}</p>
              </div>
            </div>
            <a 
              href={`tel:${job.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="btn btn-blue shrink-0 px-4 text-sm"
            >
              Call
            </a>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        type="button"
        className={`btn mt-1 w-full py-3 font-medium text-sm transition-all duration-200
                   ${getStatusActionClass(job.status)} hover:brightness-110 active:scale-[0.98]`}
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
