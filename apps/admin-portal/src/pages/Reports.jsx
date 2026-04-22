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

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl p-4 bg-white/5 border border-white/10">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
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
      { label: 'Jobs Created', value: toSafeNumber(summary.jobsCreated) },
      { label: 'Incoming Requests', value: toSafeNumber(summary.incomingRequests) },
      { label: 'Converted Requests', value: toSafeNumber(summary.convertedRequests) },
      { label: 'Jobs Completed', value: toSafeNumber(summary.jobsCompleted) },
      { label: 'Jobs Closed', value: toSafeNumber(summary.jobsClosed) },
      { label: 'Follow-Up Flagged', value: toSafeNumber(summary.followUpFlagged) },
    ];
  }, [summary]);

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
        <section className="bg-brand-panel rounded-2xl border border-brand-border p-5">
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-400 mt-1">Generate date-range summary and technician performance reports.</p>

          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <label className="block">
              <span className="text-sm text-slate-300">From</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full mt-1 rounded-lg bg-brand-bg border border-brand-border px-3 py-2 text-white"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">To</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full mt-1 rounded-lg bg-brand-bg border border-brand-border px-3 py-2 text-white"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Run Report'}
            </button>
          </form>

          {serverRange && !error && (
            <p className="text-xs text-slate-400 mt-3">
              Showing data from <strong>{serverRange.from}</strong> to <strong>{serverRange.to}</strong>.
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </section>

        <section className="bg-brand-panel rounded-2xl border border-brand-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-white">Summary</h2>
            <button
              type="button"
              onClick={exportSummaryCsv}
              disabled={!summary || loading}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Export Summary CSV
            </button>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-xl p-4 bg-white/5 border border-white/10 animate-pulse">
                  <div className="h-4 w-2/3 bg-white/10 rounded mb-3" />
                  <div className="h-8 w-1/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && !summary && !error && (
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              No summary data available for this range.
            </div>
          )}

          {!loading && summaryCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {summaryCards.map((item) => (
                <SummaryCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          )}
        </section>

        <section className="bg-brand-panel rounded-2xl border border-brand-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-white">Technician Performance</h2>
            <button
              type="button"
              onClick={exportTechniciansCsv}
              disabled={!rows.length || loading}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Export Technicians CSV
            </button>
          </div>

          {loading && (
            <div className="text-sm text-slate-300">Loading technician performance...</div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              No technician rows for this date range.
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Technician Name</th>
                    <th>Has Login Account</th>
                    <th>Jobs Assigned</th>
                    <th>Completion Submissions</th>
                    <th>Follow-Up Flagged</th>
                    <th>Open Workload</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.techId}>
                      <td>{row.name || 'Unknown'}</td>
                      <td>{row.hasLoginAccount ? 'Yes' : 'No'}</td>
                      <td>{toSafeNumber(row.jobsAssigned)}</td>
                      <td>{toSafeNumber(row.completionSubmissions)}</td>
                      <td>{toSafeNumber(row.followUpFlagged)}</td>
                      <td>{toSafeNumber(row.openWorkload)}</td>
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
