import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { reportsApi } from '../lib/api';
import { exportCSV } from '../lib/csv';

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toSafeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function SummaryCard({ label, value, accent = 'default' }) {
  const accents = {
    default: 'from-white/5 to-white/[0.02] border-white/10 hover:border-white/15',
    blue: 'from-brand-blue/10 to-brand-blue/[0.02] border-brand-blue/20 hover:border-brand-blue/30',
    teal: 'from-brand-teal/10 to-brand-teal/[0.02] border-brand-teal/20 hover:border-brand-teal/30',
  };

  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${accents[accent]} border shadow-soft transition-all duration-200 hover:shadow-md`}>
      <p className="text-sm text-slate-300 font-medium mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
    </div>
  );
}

function WorkloadBar({ value, max }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-white">{value}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[40px]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-sky to-brand-blue transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AccountBadge({ hasAccount }) {
  return hasAccount ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
      ✓ Yes
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-400 border border-white/10">
      No
    </span>
  );
}

export default function Reports() {
  const today = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => toDateInputValue(today), [today]);
  const defaultFrom = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return toDateInputValue(d);
  }, [today]);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [serverRange, setServerRange] = useState(null);

  async function runReport(fromDate = from, toDate = to) {
    if (!fromDate || !toDate) {
      setError('From and To dates are required.');
      return;
    }
    if (fromDate > toDate) {
      setError('From date cannot be after To date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [summaryRes, techRes] = await Promise.all([
        reportsApi.getDateRangeSummary({ from: fromDate, to: toDate }),
        reportsApi.getDateRangeTechnicians({ from: fromDate, to: toDate }),
      ]);

      setSummary(summaryRes?.summary || null);
      setRows(Array.isArray(techRes?.rows) ? techRes.rows : []);
      setServerRange(summaryRes?.range || techRes?.range || { from: fromDate, to: toDate });
    } catch (e) {
      setSummary(null);
      setRows([]);
      setServerRange(null);
      setError(e?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runReport(defaultFrom, defaultTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Jobs Created', value: toSafeNumber(summary.jobsCreated), accent: 'blue' },
      { label: 'Incoming Requests (Shared Pool)', value: toSafeNumber(summary.incomingRequests), accent: 'teal' },
      { label: 'Converted Requests', value: toSafeNumber(summary.convertedRequests), accent: 'teal' },
      { label: 'Jobs Completed', value: toSafeNumber(summary.jobsCompleted), accent: 'blue' },
      { label: 'Jobs Closed', value: toSafeNumber(summary.jobsClosed), accent: 'blue' },
      { label: 'Follow-Up Flagged', value: toSafeNumber(summary.followUpFlagged), accent: 'default' },
    ];
  }, [summary]);

  const maxWorkload = useMemo(() => {
    if (!rows.length) return 0;
    return Math.max(...rows.map((r) => toSafeNumber(r.openWorkload)), 1);
  }, [rows]);

  function exportSummaryCsv() {
    if (!summary) return;

    exportCSV(
      `report-summary-${from}-to-${to}`,
      [
        { key: 'from', label: 'From' },
        { key: 'to', label: 'To' },
        { key: 'jobsCreated', label: 'Jobs Created' },
        { key: 'incomingRequests', label: 'Incoming Requests' },
        { key: 'convertedRequests', label: 'Converted Requests' },
        { key: 'jobsCompleted', label: 'Jobs Completed' },
        { key: 'jobsClosed', label: 'Jobs Closed' },
        { key: 'followUpFlagged', label: 'Follow-Up Flagged' },
      ],
      [
        {
          from: serverRange?.from || from,
          to: serverRange?.to || to,
          jobsCreated: toSafeNumber(summary.jobsCreated),
          incomingRequests: toSafeNumber(summary.incomingRequests),
          convertedRequests: toSafeNumber(summary.convertedRequests),
          jobsCompleted: toSafeNumber(summary.jobsCompleted),
          jobsClosed: toSafeNumber(summary.jobsClosed),
          followUpFlagged: toSafeNumber(summary.followUpFlagged),
        },
      ]
    );
  }

  function exportTechniciansCsv() {
    if (!rows.length) return;

    exportCSV(
      `report-technicians-${from}-to-${to}`,
      [
        { key: 'techId', label: 'Tech ID' },
        { key: 'name', label: 'Technician Name' },
        { key: 'hasLoginAccountLabel', label: 'Has Login Account' },
        { key: 'jobsAssigned', label: 'Jobs Assigned' },
        { key: 'completionSubmissions', label: 'Completion Submissions' },
        { key: 'followUpFlagged', label: 'Follow-Up Flagged' },
        { key: 'openWorkload', label: 'Open Workload' },
      ],
      rows.map((row) => ({
        ...row,
        hasLoginAccountLabel: row?.hasLoginAccount ? 'Yes' : 'No',
      }))
    );
  }

  function onSubmit(event) {
    event.preventDefault();
    runReport();
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-brand-panel rounded-2xl border border-brand-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-xl border border-brand-blue/30">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Reports</h1>
              <p className="text-sm text-slate-400">Generate date-range summary and technician performance reports.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="bg-brand-bg rounded-xl border border-brand-border p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
              <label className="block">
                <span className="text-sm font-medium text-slate-300 mb-1.5 block">From Date</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg bg-brand-panel border border-brand-border px-3 py-2.5 text-white focus:border-brand-sky/50 focus:ring-1 focus:ring-brand-sky/30 outline-none transition-all"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-300 mb-1.5 block">To Date</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg bg-brand-panel border border-brand-border px-3 py-2.5 text-white focus:border-brand-sky/50 focus:ring-1 focus:ring-brand-sky/30 outline-none transition-all"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-brand-blue/20"
              >
                {loading ? 'Running...' : 'Run Report'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportSummaryCsv}
                  disabled={!summary || loading}
                  className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/10"
                  title="Export Summary CSV"
                >
                  📥 Summary
                </button>
                <button
                  type="button"
                  onClick={exportTechniciansCsv}
                  disabled={!rows.length || loading}
                  className="px-4 py-2.5 rounded-lg bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-brand-teal/30"
                  title="Export Technician CSV"
                >
                  📥 Tech
                </button>
              </div>
            </div>

            {serverRange && !error && (
              <div className="mt-4 pt-4 border-t border-brand-border/50">
                <p className="text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
                    Showing data from <strong className="text-white">{serverRange.from}</strong> to <strong className="text-white">{serverRange.to}</strong>
                  </span>
                  <span className="text-slate-500 ml-1">· Reports include activities recorded within this date range, from midnight at the start of 'From' to midnight at the end of 'To'. Same-day ranges are valid.</span>
                </p>
              </div>
            )}
          </form>

        </section>

        <section className="bg-brand-panel rounded-2xl border border-brand-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-brand-teal/20 rounded-lg flex items-center justify-center text-lg border border-brand-teal/30">
              📋
            </div>
            <h2 className="text-xl font-bold text-white">Summary</h2>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-2xl p-5 bg-white/5 border border-white/10 animate-pulse">
                  <div className="h-4 w-2/3 bg-white/10 rounded mb-3" />
                  <div className="h-8 w-1/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && !summary && !error && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <span className="text-slate-400">ℹ️</span>
                No summary data available for this range. Run a report to see results.
              </span>
            </div>
          )}

          {!loading && summaryCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryCards.map((item) => (
                <SummaryCard key={item.label} label={item.label} value={item.value} accent={item.accent} />
              ))}
            </div>
          )}
        </section>

        <section className="bg-brand-panel rounded-2xl border border-brand-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-brand-sky/20 rounded-lg flex items-center justify-center text-lg border border-brand-sky/30">
              👷
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Technician Performance</h2>
              <p className="text-sm text-slate-400">Activity within date range. Current Open Workload reflects today's live snapshot.</p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-sm text-slate-300 py-4">
              <span className="animate-pulse">⏳</span>
              Loading technician performance data...
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <span className="text-slate-400">ℹ️</span>
                No technician activity recorded for this date range.
              </span>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="overflow-x-auto -mx-2">
              <table className="table text-sm w-full">
                <thead>
                  <tr>
                    <th className="text-left">Technician</th>
                    <th className="text-center">Account</th>
                    <th className="text-right">Jobs</th>
                    <th className="text-right">Completions</th>
                    <th className="text-right">Follow-Ups</th>
                    <th className="text-left pl-4">Open Workload</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.techId}>
                      <td className="font-medium text-white">{row.name || 'Unknown'}</td>
                      <td className="text-center">
                        <AccountBadge hasAccount={row.hasLoginAccount} />
                      </td>
                      <td className="text-right font-semibold">{toSafeNumber(row.jobsAssigned)}</td>
                      <td className="text-right text-brand-teal">{toSafeNumber(row.completionSubmissions)}</td>
                      <td className="text-right text-brand-sky">{toSafeNumber(row.followUpFlagged)}</td>
                      <td className="pl-4">
                        <WorkloadBar value={toSafeNumber(row.openWorkload)} max={maxWorkload} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
