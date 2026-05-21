import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { reportsApi } from '../lib/api';
import { exportCSV } from '../lib/csv';

const chartColors = {
  jobsCreated: '#52D5FF',
  jobsCompleted: '#31EE88',
  jobsClosed: '#94A3B8',
  incomingRequests: '#60A5FA',
  convertedRequests: '#34D399',
  unconvertedRequests: '#F59E0B',
  followUpFlagged: '#F472B6',
  openWorkload: '#A78BFA',
};

const pipelineColors = ['#64748B', '#60A5FA', '#38BDF8', '#F59E0B', '#FB923C', '#E879F9', '#34D399', '#94A3B8'];
const workloadColors = ['#A78BFA', '#34D399', '#60A5FA', '#F59E0B', '#F472B6', '#94A3B8'];

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toSafeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function safePercent(numerator, denominator) {
  const bottom = toSafeNumber(denominator);
  if (bottom <= 0) return 0;
  return Math.round((toSafeNumber(numerator) / bottom) * 1000) / 10;
}

function formatPercent(value) {
  return `${toSafeNumber(value).toFixed(1)}%`;
}

function formatDateLabel(date) {
  if (!date) return '';
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function SummaryCard({ label, value, accent = 'default', detail }) {
  const accents = {
    default: {
      panel: 'from-white/5 to-white/[0.02] border-white/10',
      marker: 'bg-slate-300',
      text: 'text-slate-300',
    },
    blue: {
      panel: 'from-brand-blue/15 to-brand-blue/[0.03] border-brand-blue/25',
      marker: 'bg-brand-sky',
      text: 'text-brand-sky',
    },
    teal: {
      panel: 'from-brand-teal/15 to-brand-teal/[0.03] border-brand-teal/25',
      marker: 'bg-brand-teal',
      text: 'text-brand-teal',
    },
    amber: {
      panel: 'from-amber-500/15 to-amber-500/[0.03] border-amber-400/25',
      marker: 'bg-amber-300',
      text: 'text-amber-200',
    },
    rose: {
      panel: 'from-rose-500/15 to-rose-500/[0.03] border-rose-400/25',
      marker: 'bg-rose-300',
      text: 'text-rose-200',
    },
  };
  const tone = accents[accent] || accents.default;

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-soft sm:p-5 ${tone.panel}`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${tone.marker}`} />
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone.text}`}>{label}</p>
      <p className="mt-2 text-3xl font-extrabold leading-none text-white">{value}</p>
      {detail && <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>}
    </div>
  );
}

function ReportState({ title, message, tone = 'empty', compact = false }) {
  const tones = {
    empty: 'border-white/10 bg-white/[0.04]',
    loading: 'border-brand-sky/25 bg-brand-sky/10',
    error: 'border-rose-400/35 bg-rose-500/10',
  };
  const textColor = tone === 'error' ? 'text-rose-100' : 'text-slate-300';

  return (
    <div className={`surface rounded-2xl border ${tones[tone] || tones.empty} ${compact ? 'p-5' : 'p-6 text-center sm:p-8'}`}>
      <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-brand-sky/60" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${textColor}`}>{message}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`surface rounded-2xl p-4 sm:p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 h-4 w-2/3 rounded bg-white/10" />
          <div className="h-8 w-1/3 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }) {
  const width = 680;
  const height = 280;
  const pad = { top: 18, right: 20, bottom: 34, left: 34 };
  const keys = [
    { key: 'jobsCreated', label: 'Created', color: chartColors.jobsCreated },
    { key: 'jobsCompleted', label: 'Completed', color: chartColors.jobsCompleted },
    { key: 'jobsClosed', label: 'Closed', color: chartColors.jobsClosed },
  ];
  const maxValue = Math.max(1, ...data.flatMap((row) => keys.map((item) => toSafeNumber(row[item.key]))));
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const xFor = (index) => pad.left + (data.length <= 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const yFor = (value) => pad.top + innerHeight - (toSafeNumber(value) / maxValue) * innerHeight;
  const pointsFor = (key) => data.map((row, index) => ({ x: xFor(index), y: yFor(row[key]) }));
  const pathFor = (points) => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  const areaPoints = pointsFor('jobsCreated');
  const baseline = pad.top + innerHeight;
  const areaPath = areaPoints.length
    ? `${pathFor(areaPoints)} L ${areaPoints[areaPoints.length - 1].x} ${baseline} L ${areaPoints[0].x} ${baseline} Z`
    : '';

  return (
    <div>
      <svg className="h-80 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Job trend chart">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = pad.top + innerHeight - ratio * innerHeight;
          return (
            <g key={ratio}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
              <text x={pad.left - 10} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="11">
                {Math.round(maxValue * ratio)}
              </text>
            </g>
          );
        })}
        {areaPath && <path d={areaPath} fill={chartColors.jobsCreated} opacity="0.1" />}
        {keys.map((item) => {
          const points = pointsFor(item.key);
          return (
            <g key={item.key}>
              <path d={pathFor(points)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point, index) => (
                <circle key={`${item.key}-${data[index]?.date}`} cx={point.x} cy={point.y} r="3" fill={item.color} />
              ))}
            </g>
          );
        })}
        {data.map((row, index) => (
          index % labelEvery === 0 || index === data.length - 1 ? (
            <text key={row.date} x={xFor(index)} y={height - 10} textAnchor="middle" fill="#94A3B8" fontSize="11">
              {row.label}
            </text>
          ) : null
        ))}
      </svg>
      <ChartLegend items={keys} />
    </div>
  );
}

function RequestTrendChart({ data }) {
  const width = 680;
  const height = 280;
  const pad = { top: 18, right: 20, bottom: 34, left: 34 };
  const keys = [
    { key: 'incomingRequests', label: 'Incoming', color: chartColors.incomingRequests },
    { key: 'convertedRequests', label: 'Converted', color: chartColors.convertedRequests },
  ];
  const maxValue = Math.max(1, ...data.flatMap((row) => keys.map((item) => toSafeNumber(row[item.key]))));
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const xFor = (index) => pad.left + (data.length <= 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const yFor = (value) => pad.top + innerHeight - (toSafeNumber(value) / maxValue) * innerHeight;
  const pointsFor = (key) => data.map((row, index) => ({ x: xFor(index), y: yFor(row[key]) }));
  const pathFor = (points) => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div>
      <svg className="h-80 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Request momentum chart">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = pad.top + innerHeight - ratio * innerHeight;
          return (
            <g key={ratio}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
              <text x={pad.left - 10} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="11">
                {Math.round(maxValue * ratio)}
              </text>
            </g>
          );
        })}
        {keys.map((item) => {
          const points = pointsFor(item.key);
          return (
            <g key={item.key}>
              <path d={pathFor(points)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point, index) => (
                <circle key={`${item.key}-${data[index]?.date}`} cx={point.x} cy={point.y} r="3" fill={item.color} />
              ))}
            </g>
          );
        })}
        {data.map((row, index) => (
          index % labelEvery === 0 || index === data.length - 1 ? (
            <text key={row.date} x={xFor(index)} y={height - 10} textAnchor="middle" fill="#94A3B8" fontSize="11">
              {row.label}
            </text>
          ) : null
        ))}
      </svg>
      <ChartLegend items={keys} />
    </div>
  );
}

function ConversionBars({ data }) {
  const maxValue = Math.max(1, ...data.map((row) => row.value));

  return (
    <div>
      <div className="grid h-72 grid-cols-3 items-end gap-4 border-b border-white/10 pb-3">
        {data.map((row) => {
          const height = Math.max((row.value / maxValue) * 100, row.value > 0 ? 8 : 0);
          return (
            <div key={row.name} className="flex h-full flex-col justify-end">
              <div className="mb-3 text-center text-2xl font-extrabold text-white">{row.value}</div>
              <div
                className="mx-auto w-full max-w-24 rounded-t-2xl border border-white/10"
                style={{ height: `${height}%`, backgroundColor: row.fill }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {data.map((row) => (
          <div key={row.name} className="text-center text-xs font-medium text-slate-300">
            <span className="mx-auto mb-2 block h-2 w-2 rounded-full" style={{ backgroundColor: row.fill }} />
            {row.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpPressureBoard({ rows }) {
  const maxCompletions = Math.max(1, ...rows.map((row) => row.completionSubmissions));
  const maxFollowUps = Math.max(1, ...rows.map((row) => row.followUpFlagged));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white">{row.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{formatPercent(row.followUpRate)} follow-up rate</p>
            </div>
            <span className="badge badge-slate">{row.openWorkload} open</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>Completions</span>
                <span className="font-semibold text-white">{row.completionSubmissions}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-teal"
                  style={{ width: `${(row.completionSubmissions / maxCompletions) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>Follow-ups</span>
                <span className="font-semibold text-white">{row.followUpFlagged}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-rose-300"
                  style={{ width: `${(row.followUpFlagged / maxFollowUps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TechnicianBars({ rows }) {
  const metrics = [
    { key: 'jobsAssigned', label: 'Jobs', color: chartColors.jobsCreated },
    { key: 'completionSubmissions', label: 'Completions', color: chartColors.jobsCompleted },
    { key: 'followUpFlagged', label: 'Follow-Ups', color: chartColors.followUpFlagged },
    { key: 'openWorkload', label: 'Open Workload', color: chartColors.openWorkload },
  ];
  const maxValue = Math.max(1, ...rows.flatMap((row) => metrics.map((metric) => toSafeNumber(row[metric.key]))));

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="truncate text-sm font-semibold text-white">{row.name}</div>
            <div className="text-xs text-slate-500">
              {metrics.reduce((sum, metric) => sum + toSafeNumber(row[metric.key]), 0)} total signals
            </div>
          </div>
          <div className="grid gap-2">
            {metrics.map((metric) => {
              const value = toSafeNumber(row[metric.key]);
              return (
                <div key={metric.key} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2">
                  <div className="truncate text-xs text-slate-400">{metric.label}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(value / maxValue) * 100}%`, backgroundColor: metric.color }}
                    />
                  </div>
                  <div className="text-right text-xs font-semibold text-white">{value}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <ChartLegend items={metrics} />
    </div>
  );
}

function PipelineDonut({ data, label = 'jobs', colors = pipelineColors }) {
  const total = data.reduce((sum, row) => sum + toSafeNumber(row.value), 0);
  let cursor = 0;
  const segments = data.map((row, index) => {
    const start = cursor;
    const end = cursor + (toSafeNumber(row.value) / Math.max(total, 1)) * 360;
    cursor = end;
    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative grid h-56 w-56 place-items-center rounded-full"
        style={{ background: `conic-gradient(${segments.join(', ')})` }}
      >
        <div className="grid h-32 w-32 place-items-center rounded-full border border-white/10 bg-[#0c1450] text-center">
          <div>
            <div className="text-3xl font-extrabold text-white">{total}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {data.map((row, index) => (
          <div key={row.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              {row.name}
            </span>
            <span className="font-semibold text-white">{row.value}</span>
          </div>
        ))}
      </div>
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
  const [trend, setTrend] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState([]);

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
      setTrend(Array.isArray(summaryRes?.trend) ? summaryRes.trend : []);
      setPipelineStatus(Array.isArray(summaryRes?.pipelineStatus) ? summaryRes.pipelineStatus : []);
    } catch (e) {
      setSummary(null);
      setRows([]);
      setServerRange(null);
      setTrend([]);
      setPipelineStatus([]);
      setError(e?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runReport(defaultFrom, defaultTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    const jobsCreated = toSafeNumber(summary?.jobsCreated);
    const incomingRequests = toSafeNumber(summary?.incomingRequests);
    const convertedRequests = toSafeNumber(summary?.convertedRequests);
    const jobsCompleted = toSafeNumber(summary?.jobsCompleted);
    const jobsClosed = toSafeNumber(summary?.jobsClosed);
    const followUpFlagged = toSafeNumber(summary?.followUpFlagged);

    return {
      jobsCreated,
      incomingRequests,
      convertedRequests,
      unconvertedRequests: Math.max(incomingRequests - convertedRequests, 0),
      jobsCompleted,
      jobsClosed,
      followUpFlagged,
      conversionRate: safePercent(convertedRequests, incomingRequests),
      completionRate: safePercent(jobsCompleted, jobsCreated),
    };
  }, [summary]);

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Jobs Created', value: metrics.jobsCreated, accent: 'blue', detail: 'New jobs in selected range' },
      { label: 'Incoming Requests', value: metrics.incomingRequests, accent: 'teal', detail: 'Shared lead pool' },
      { label: 'Converted Requests', value: metrics.convertedRequests, accent: 'teal', detail: `${formatPercent(metrics.conversionRate)} conversion` },
      { label: 'Jobs Completed', value: metrics.jobsCompleted, accent: 'blue', detail: `${formatPercent(metrics.completionRate)} of jobs created` },
      { label: 'Jobs Closed', value: metrics.jobsClosed, accent: 'default', detail: 'Admin closed out' },
      { label: 'Follow-Up Flagged', value: metrics.followUpFlagged, accent: 'rose', detail: 'Requires admin attention' },
      { label: 'Conversion Rate', value: formatPercent(metrics.conversionRate), accent: 'teal', detail: 'Converted / incoming' },
      { label: 'Completion Rate', value: formatPercent(metrics.completionRate), accent: 'blue', detail: 'Completed / created' },
    ];
  }, [metrics, summary]);

  const trendData = useMemo(() => (
    (trend || []).map((row) => ({
      ...row,
      label: formatDateLabel(row.date),
      jobsCreated: toSafeNumber(row.jobsCreated),
      jobsCompleted: toSafeNumber(row.jobsCompleted),
      jobsClosed: toSafeNumber(row.jobsClosed),
      incomingRequests: toSafeNumber(row.incomingRequests),
      convertedRequests: toSafeNumber(row.convertedRequests),
    }))
  ), [trend]);

  const requestConversionData = useMemo(() => ([
    { name: 'Incoming', value: metrics.incomingRequests, fill: chartColors.incomingRequests },
    { name: 'Converted', value: metrics.convertedRequests, fill: chartColors.convertedRequests },
    { name: 'Unconverted', value: metrics.unconvertedRequests, fill: chartColors.unconvertedRequests },
  ]), [metrics]);

  const technicianChartRows = useMemo(() => (
    [...rows]
      .sort((a, b) => (
        toSafeNumber(b.jobsAssigned) +
        toSafeNumber(b.completionSubmissions) +
        toSafeNumber(b.openWorkload)
      ) - (
        toSafeNumber(a.jobsAssigned) +
        toSafeNumber(a.completionSubmissions) +
        toSafeNumber(a.openWorkload)
      ))
      .slice(0, 8)
      .map((row) => ({
        name: row.name || 'Unknown',
        jobsAssigned: toSafeNumber(row.jobsAssigned),
        completionSubmissions: toSafeNumber(row.completionSubmissions),
        followUpFlagged: toSafeNumber(row.followUpFlagged),
        openWorkload: toSafeNumber(row.openWorkload),
      }))
  ), [rows]);

  const followUpPressureRows = useMemo(() => (
    [...rows]
      .map((row) => {
        const completionSubmissions = toSafeNumber(row.completionSubmissions);
        const followUpFlagged = toSafeNumber(row.followUpFlagged);
        return {
          name: row.name || 'Unknown',
          completionSubmissions,
          followUpFlagged,
          openWorkload: toSafeNumber(row.openWorkload),
          followUpRate: safePercent(followUpFlagged, completionSubmissions),
        };
      })
      .filter((row) => row.completionSubmissions || row.followUpFlagged || row.openWorkload)
      .sort((a, b) => (
        b.followUpRate - a.followUpRate ||
        b.followUpFlagged - a.followUpFlagged ||
        b.openWorkload - a.openWorkload
      ))
      .slice(0, 6)
  ), [rows]);

  const pipelineData = useMemo(() => (
    (pipelineStatus || [])
      .map((row) => ({
        name: row.status || 'Unknown',
        value: toSafeNumber(row.count),
      }))
      .filter((row) => row.value > 0)
  ), [pipelineStatus]);

  const workloadSplitData = useMemo(() => {
    const sortedWorkload = [...rows]
      .map((row) => ({
        name: row.name || 'Unknown',
        value: toSafeNumber(row.openWorkload),
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value);
    const topTechnicians = sortedWorkload.slice(0, 5);
    const otherWorkload = sortedWorkload.slice(5).reduce((sum, row) => sum + row.value, 0);

    return otherWorkload > 0
      ? [...topTechnicians, { name: 'Other technicians', value: otherWorkload }]
      : topTechnicians;
  }, [rows]);

  const insights = useMemo(() => {
    const busiestTech = rows.reduce((best, row) => (
      toSafeNumber(row.jobsAssigned) > toSafeNumber(best?.jobsAssigned) ? row : best
    ), null);
    const highestWorkload = rows.reduce((best, row) => (
      toSafeNumber(row.openWorkload) > toSafeNumber(best?.openWorkload) ? row : best
    ), null);
    const busiestDay = trendData.reduce((best, row) => {
      const total = toSafeNumber(row.jobsCreated) + toSafeNumber(row.jobsCompleted) + toSafeNumber(row.jobsClosed);
      const bestTotal = toSafeNumber(best?.jobsCreated) + toSafeNumber(best?.jobsCompleted) + toSafeNumber(best?.jobsClosed);
      return total > bestTotal ? row : best;
    }, null);

    return [
      { label: 'Conversion rate', value: formatPercent(metrics.conversionRate), detail: 'Lead conversion health' },
      { label: 'Completion rate', value: formatPercent(metrics.completionRate), detail: 'Completion against created jobs' },
      {
        label: 'Busiest technician',
        value: busiestTech?.name || 'No activity',
        detail: `${toSafeNumber(busiestTech?.jobsAssigned)} jobs assigned`,
      },
      {
        label: 'Highest open workload',
        value: highestWorkload?.name || 'No workload',
        detail: `${toSafeNumber(highestWorkload?.openWorkload)} open jobs`,
      },
      {
        label: 'Busiest day',
        value: busiestDay?.label || 'No activity',
        detail: `${toSafeNumber(busiestDay?.jobsCreated) + toSafeNumber(busiestDay?.jobsCompleted) + toSafeNumber(busiestDay?.jobsClosed)} job events`,
      },
    ];
  }, [metrics, rows, trendData]);

  const hasTrendData = trendData.some((row) => (
    row.jobsCreated || row.jobsCompleted || row.jobsClosed
  ));
  const hasRequestTrendData = trendData.some((row) => (
    row.incomingRequests || row.convertedRequests
  ));
  const hasRequestData = requestConversionData.some((row) => row.value > 0);
  const hasTechnicianChartData = technicianChartRows.some((row) => (
    row.jobsAssigned || row.completionSubmissions || row.followUpFlagged || row.openWorkload
  ));
  const hasWorkloadSplitData = workloadSplitData.length > 0;
  const hasFollowUpPressureData = followUpPressureRows.length > 0;

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
          jobsCreated: metrics.jobsCreated,
          incomingRequests: metrics.incomingRequests,
          convertedRequests: metrics.convertedRequests,
          jobsCompleted: metrics.jobsCompleted,
          jobsClosed: metrics.jobsClosed,
          followUpFlagged: metrics.followUpFlagged,
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

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <section className="surface rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Reports</h1>
                {serverRange && (
                  <span className="badge badge-neutral">
                    {serverRange.from} to {serverRange.to}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Track request conversion, job throughput, technician load, and operational momentum for the selected date range.
              </p>
            </div>

            <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,10rem)_minmax(0,10rem)_auto] xl:grid-cols-[minmax(0,10rem)_minmax(0,10rem)_auto_auto]">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-300">From Date</span>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="input bg-brand-panel"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-300">To Date</span>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="input bg-brand-panel"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Running...' : 'Run Report'}
                </button>

                <div className="flex gap-2 md:col-span-3 xl:col-span-1">
                  <button
                    type="button"
                    onClick={exportSummaryCsv}
                    disabled={!summary || loading}
                    className="btn btn-ghost flex-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 xl:flex-none"
                    title="Export Summary CSV"
                  >
                    Summary CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportTechniciansCsv}
                    disabled={!rows.length || loading}
                    className="btn btn-success flex-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 xl:flex-none"
                    title="Export Technician CSV"
                  >
                    Tech CSV
                  </button>
                </div>
              </div>

              {serverRange && !error && (
                <div className="mt-4 border-t border-brand-border/50 pt-4">
                  <p className="text-sm leading-6 text-slate-400">
                    Showing data from <strong className="text-white">{serverRange.from}</strong> to <strong className="text-white">{serverRange.to}</strong>.
                    <span className="text-slate-500"> Same-day ranges are valid.</span>
                  </p>
                </div>
              )}
            </form>
          </div>

          {error && (
            <div className="mt-4">
              <ReportState
                compact
                tone="error"
                title="Report could not run"
                message={error}
              />
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">KPI Summary</h2>
            <p className="mt-1 text-sm text-slate-400">Core business indicators for the selected range.</p>
          </div>

          {loading && <SkeletonCards />}

          {!loading && !summary && !error && (
            <ReportState
              title="No summary data"
              message="No summary data available for this range. Run a report to see results."
            />
          )}

          {!loading && summaryCards.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((item) => (
                <SummaryCard key={item.label} {...item} />
              ))}
            </div>
          )}
        </section>

        {!loading && summary && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {insights.map((item) => (
              <div key={item.label} className="surface rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-2 truncate text-xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
              </div>
            ))}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard
            title="Job Trend"
            subtitle="Jobs created, completed, and closed over time."
            className="xl:col-span-2"
          >
            {loading ? (
              <ReportState tone="loading" title="Loading trend" message="Preparing job trend data..." compact />
            ) : hasTrendData ? (
              <TrendChart data={trendData} />
            ) : (
              <ReportState title="No job trend yet" message="No created, completed, or closed jobs were recorded in this range." />
            )}
          </ChartCard>

          <ChartCard
            title="Request Conversion"
            subtitle="Incoming requests compared with converted and unconverted leads."
          >
            {loading ? (
              <ReportState tone="loading" title="Loading conversion" message="Preparing request conversion data..." compact />
            ) : hasRequestData ? (
              <ConversionBars data={requestConversionData} />
            ) : (
              <ReportState title="No request data" message="No incoming requests were recorded in this range." />
            )}
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard
            title="Technician Performance"
            subtitle="Top technicians by assigned jobs, completions, follow-ups, and open workload."
            className="xl:col-span-2"
          >
            {loading ? (
              <ReportState tone="loading" title="Loading technicians" message="Preparing technician performance data..." compact />
            ) : hasTechnicianChartData ? (
              <TechnicianBars rows={technicianChartRows} />
            ) : (
              <ReportState title="No technician activity" message="No technician activity recorded for this date range." />
            )}
          </ChartCard>

          <div className="space-y-4">
            <ChartCard
              title="Pipeline Distribution"
              subtitle="Current job status mix across the business."
            >
              {loading ? (
                <ReportState tone="loading" title="Loading pipeline" message="Preparing pipeline distribution..." compact />
              ) : pipelineData.length ? (
                <PipelineDonut data={pipelineData} />
              ) : (
                <ReportState title="No pipeline data" message="No current jobs are available for pipeline distribution." />
              )}
            </ChartCard>

            <ChartCard
              title="Open Workload Split"
              subtitle="Current open jobs grouped by technician."
            >
              {loading ? (
                <ReportState tone="loading" title="Loading workload" message="Preparing open workload split..." compact />
              ) : hasWorkloadSplitData ? (
                <PipelineDonut data={workloadSplitData} label="open jobs" colors={workloadColors} />
              ) : (
                <ReportState title="No open workload" message="No technicians currently have open jobs in this report snapshot." />
              )}
            </ChartCard>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard
            title="Request Momentum"
            subtitle="Daily incoming requests against converted requests."
            className="xl:col-span-2"
          >
            {loading ? (
              <ReportState tone="loading" title="Loading request trend" message="Preparing request momentum data..." compact />
            ) : hasRequestTrendData ? (
              <RequestTrendChart data={trendData} />
            ) : (
              <ReportState title="No request momentum" message="No incoming or converted request activity was recorded in this range." />
            )}
          </ChartCard>

          <ChartCard
            title="Follow-Up Pressure"
            subtitle="Technicians with the highest follow-up rate or open workload."
          >
            {loading ? (
              <ReportState tone="loading" title="Loading pressure board" message="Preparing follow-up pressure data..." compact />
            ) : hasFollowUpPressureData ? (
              <FollowUpPressureBoard rows={followUpPressureRows} />
            ) : (
              <ReportState title="No follow-up pressure" message="No follow-ups, completions, or open workload were recorded for technicians in this range." />
            )}
          </ChartCard>
        </section>
      </main>
    </div>
  );
}
