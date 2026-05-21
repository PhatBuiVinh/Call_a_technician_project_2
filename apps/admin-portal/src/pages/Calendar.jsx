// src/pages/Calendar.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { api } from '../lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const SLOT = '00:30:00'; // 30-min cells
const JOB_STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Completed', 'Closed'];
const LEGEND_STATUSES = ['Open', 'In Progress', 'Completed', 'Closed'];
const TIME_OFF_COLOR = {
  bg: 'rgba(244, 63, 94, .22)',
  border: 'rgba(251, 113, 133, .4)',
};

export default function CalendarPage() {
  const calendarRef = useRef(null);

  // technicians
  const [techs, setTechs] = useState([]);
  const [techFilter, setTechFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // refresh key to trigger FullCalendar refetch
  const [refreshKey, setRefreshKey] = useState(0);

  // mode: normal time-grid OR columns-per-tech
  const [mode, setMode] = useState('time'); // 'time' | 'tech'

  // modal state
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const empty = {
    title: '',
    invoice: '',
    status: 'Open',
    priority: 'Medium',
    technician: '',
    phone: '',
    description: '',
    startAt: '',
    endAt: '',
  };
  const [form, setForm] = useState(empty);

  // time-off windows (fetched for the visible range)
  const [timeoff, setTimeoff] = useState([]);

  // load technicians once
  useEffect(() => {
    (async () => {
      try {
        const list = await api('/technicians').catch(() => api('/techs'));
        const names = (list || []).filter(t => t.active !== false).map(t => t.name || t.fullName || t.title).filter(Boolean);
        setTechs(names);
      } catch {
        setTechs([]);
      }
    })();
  }, []);

  // helper: event mapper
  const jobToEvent = useCallback((j) => {
    const color = colorByStatus(j.status);
    const label = [j.title || j.invoice || 'Job', j.technician ? `• ${j.technician}` : ''].filter(Boolean).join(' ');
    return {
      id: j._id,
      title: label,
      start: j.startAt,
      end: j.endAt,
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: '#fff',
      extendedProps: { job: j },
    };
  }, []);

  // fetch timeoff for visible range
  const onDatesSet = useCallback(async (arg) => {
    try {
      const params = new URLSearchParams({ from: arg.startStr, to: arg.endStr });
      const list = await api('/timeoff?' + params.toString()).catch(() => []);
      setTimeoff(Array.isArray(list) ? list : []);
    } catch { setTimeoff([]); }
  }, []);

  // event source (jobs)
  const eventsFetcher = useCallback(async (info, success, failure) => {
    try {
      const p = new URLSearchParams({
        scheduled: 'true',
        from: info.startStr,
        to: info.endStr,
      });
      if (techFilter !== 'All') p.set('technician', techFilter);
      const list = await api('/jobs?' + p.toString());
      success(filterJobsByStatus(list || [], statusFilter).map(jobToEvent));
    } catch (e) {
      failure(e);
    }
  }, [jobToEvent, techFilter, statusFilter, refreshKey]);

  // background events for time-off (drawn per calendar)
  const timeoffBgEvents = useCallback((info, success) => {
    const within = timeoff.filter(t =>
      (new Date(t.startAt) < info.end) && (new Date(t.endAt) > info.start)
    );
    const filtered = techFilter === 'All'
      ? within
      : within.filter(t => (t.technician || '') === techFilter);

    success(filtered.map(t => ({
      start: t.startAt,
      end: t.endAt,
      display: 'background',
      overlap: false,
      backgroundColor: TIME_OFF_COLOR.bg,
      borderColor: TIME_OFF_COLOR.border,
      extendedProps: { timeoff: t }
    })));
  }, [timeoff, techFilter]);

  // selection guard: block overlap with time-off
  const selectAllow = useCallback((sel) => {
    const tech = techFilter === 'All' ? form.technician : techFilter;
    if (!tech) return true; // allow if no tech chosen yet
    const overlaps = timeoff.some(t => {
      if ((t.technician || '') !== tech) return false;
      return !(sel.end <= new Date(t.startAt) || sel.start >= new Date(t.endAt));
    });
    return !overlaps;
  }, [timeoff, techFilter, form.technician]);

  // select to create
  const onSelect = useCallback((sel) => {
    setEditingId(null);
    setForm({
      ...empty,
      technician: techFilter !== 'All' ? techFilter : '',
      startAt: sel.startStr,
      endAt: sel.endStr,
    });
    setOpen(true);
  }, [techFilter]);

  // click to edit
  const onEventClick = useCallback((arg) => {
    const j = arg.event.extendedProps.job;
    setEditingId(j._id);
    setForm({
      title: j.title || '',
      invoice: j.invoice || '',
      status: j.status || 'Open',
      priority: j.priority || 'Medium',
      technician: j.technician || '',
      phone: j.phone || '',
      description: j.description || '',
      startAt: arg.event.startStr,
      endAt: arg.event.endStr,
    });
    setOpen(true);
  }, []);

  // drag/resize update
  const onEventChange = useCallback(async (arg) => {
    try {
      await api(`/jobs/${arg.event.id}`, {
        method: 'PUT',
        body: { startAt: arg.event.startStr, endAt: arg.event.endStr },
      });
      // refetch events to show updated data
      setRefreshKey(k => k + 1);
    } catch (e) {
      alert(e.message || 'Update failed');
      arg.revert();
    }
  }, []);

  // save (create/update) — close modal and refresh events
  const save = useCallback(async () => {
    try {
      const body = { ...form };
      if (editingId) {
        await api(`/jobs/${editingId}`, { method: 'PUT', body });
      } else {
        await api('/jobs', { method: 'POST', body });
      }
      // close modal and refetch events
      setOpen(false);
      setEditingId(null);
      setForm(empty);
      setRefreshKey(k => k + 1);
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  }, [form, editingId]);

  // delete
  const remove = useCallback(async () => {
    if (!editingId) return;
    if (!confirm('Delete this job?')) return;
    try {
      await api(`/jobs/${editingId}`, { method: 'DELETE' });
      // close modal and refetch events
      setOpen(false);
      setEditingId(null);
      setForm(empty);
      setRefreshKey(k => k + 1);
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  }, [editingId]);

  // shared FC props
  const fcCommon = {
    plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: false,
    slotDuration: SLOT,
    slotLabelInterval: SLOT,
    selectable: true,
    selectMirror: true,
    editable: true,
    eventOverlap: true,
    allDaySlot: true,
    expandRows: true,
    height: 'auto',
    select: onSelect,
    selectAllow,
    eventClick: onEventClick,
    eventDrop: onEventChange,
    eventResize: onEventChange,
    eventContent: renderJobEventContent,
    eventDidMount: (arg) => {
      const job = arg.event.extendedProps?.job;
      if (job) arg.el.setAttribute('title', buildEventTooltip(job));
    },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    datesSet: onDatesSet,
  };

  // UI: controls
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <section className="surface rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Schedule</h1>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Plan jobs by technician, time, and availability.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,12rem)_minmax(0,12rem)_auto] xl:w-auto">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-300">Technician</span>
                <select
                  className="select bg-brand-panel"
                  value={techFilter}
                  onChange={e => setTechFilter(e.target.value)}
                >
                  <option value="All">All technicians</option>
                  {techs.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-300">Status</span>
                <select
                  className="select bg-brand-panel"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  {JOB_STATUS_FILTERS.map(status => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-300">View</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`btn btn-ghost px-3 text-sm ${mode==='time' ? 'bg-white/12 border-brand-sky/40 text-brand-sky' : ''}`}
                    onClick={()=>setMode('time')}
                    title="Week/Day view"
                  >
                    Week/Day
                  </button>
                  <button
                    type="button"
                    className={`btn btn-ghost px-3 text-sm ${mode==='tech' ? 'bg-white/12 border-brand-sky/40 text-brand-sky' : ''}`}
                    onClick={()=>setMode('tech')}
                    title="Columns per technician"
                  >
                    Tech columns
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface rounded-2xl p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-sm font-semibold text-white">Legend</span>
            {LEGEND_STATUSES.map(status => {
              const color = colorByStatus(status);
              return (
                <span key={status} className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full border"
                    style={{ backgroundColor: color.bg, borderColor: color.border }}
                  />
                  {status}
                </span>
              );
            })}
            <span className="inline-flex items-center gap-2 text-sm text-slate-300">
              <span
                className="h-2.5 w-2.5 rounded-full border"
                style={{ backgroundColor: TIME_OFF_COLOR.bg, borderColor: TIME_OFF_COLOR.border }}
              />
              Time Off
            </span>
          </div>
        </section>


        {/* calendar */}
        {mode === 'time' ? (
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <FullCalendar
              ref={calendarRef}
              {...fcCommon}
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"

              /* 👇 24 hours visible + 30-min grid + prettier “12:00 am” labels */
              slotDuration="00:30:00"
              slotLabelInterval="00:30:00"
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              slotLabelContent={(arg) => formatSlotLabel(arg.date)}         
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,dayGridMonth,timeGridDay'
              }}
              eventSources={[
                eventsFetcher,
                timeoffBgEvents,
              ]}
            />
          </div>
        ) : (
          <TechColumns
            techs={techFilter==='All' ? techs : [techFilter]}
            fcCommon={fcCommon}
            timeoffBgEvents={timeoffBgEvents}
            statusFilter={statusFilter}
          />
        )}
      </main>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-[9999]" onMouseDown={()=>setOpen(false)}>
          <div className="w-full max-w-3xl rounded-2xl bg-[#0e1036] border border-white/10 p-5" onMouseDown={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingId ? 'Edit Job' : 'New Job'}</h3>
              <button onClick={()=>setOpen(false)} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title">
                <input className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                       value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
              </Field>
              <Field label="Invoice">
                <input className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                       value={form.invoice} onChange={e=>setForm({...form, invoice:e.target.value})}/>
              </Field>

              <Field label="Priority">
                <select className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
                  {['Low','Medium','High','Urgent'].map(p=><option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                  {['Open','In Progress','Closed'].map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Technician">
                <select className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value={form.technician} onChange={e=>setForm({...form, technician:e.target.value})}>
                  <option value="">—</option>
                  {techs.map(t=><option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Phone">
                <input className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                       value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
              </Field>

              <Field label="Start">
                <input type="datetime-local" className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                       value={toLocal(form.startAt)} onChange={e=>setForm({...form, startAt: fromLocal(e.target.value)})}/>
              </Field>
              <Field label="End">
                <input type="datetime-local" className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                       value={toLocal(form.endAt)} onChange={e=>setForm({...form, endAt: fromLocal(e.target.value)})}/>
              </Field>

              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea rows={3} className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                            value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
                </Field>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <div>
                {editingId && (
                  <button onClick={remove} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10">
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setOpen(false)} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">Cancel</button>
                <button onClick={save} className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Technician columns (no premium) ---------- */
function TechColumns({ techs, fcCommon, timeoffBgEvents, statusFilter }) {
  // each technician gets its own calendar; share the same toolbar above each
  // You can style the header to appear once if desired (kept simple here).
  return (
    <div className="grid gap-3"
         style={{ gridTemplateColumns: `repeat(${Math.max(1, techs.length)}, minmax(300px, 1fr))` }}>
      {techs.map(t => (
        <div key={t} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <div className="px-3 py-2 text-sm text-slate-300 border-b border-white/10">Technician: <b>{t}</b></div>
          <FullCalendar
            {...fcCommon}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
            events={(info, success, failure) => {
              const wrapped = async () => {
                try {
                  const p = new URLSearchParams({ scheduled:'true', from:info.startStr, to:info.endStr, technician:t });
                  const list = await api('/jobs?' + p.toString());
                  success(filterJobsByStatus(list || [], statusFilter).map(j => {
                    const color = colorByStatus(j.status);
                    const label = [j.title || j.invoice || 'Job', j.technician ? `• ${j.technician}` : ''].filter(Boolean).join(' ');
                    return {
                      id: j._id,
                      title: label,
                      start: j.startAt,
                      end: j.endAt,
                      backgroundColor: color.bg, borderColor: color.border, textColor:'#fff',
                      extendedProps: { job: j }
                    };
                  }));
                } catch(e){ failure(e); }
              };
              wrapped();
            }}
            eventSources={[
              (info, success) => {
                timeoffBgEvents(info, success);
              }
            ]}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------- helpers ---------- */
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      {children}
    </label>
  );
}
function toLocal(iso) {
  if (!iso) return '';
  const dt = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
function fromLocal(local) { return new Date(local).toISOString(); }

function filterJobsByStatus(jobs, statusFilter) {
  if (statusFilter === 'All') return jobs;
  return jobs.filter(job => (job.status || 'Open') === statusFilter);
}

function renderJobEventContent(arg) {
  const job = arg.event.extendedProps?.job || {};
  const title = job.title || job.invoice || arg.event.title || 'Job';
  const details = [
    job.technician || 'Unassigned',
    job.invoice,
    job.phone,
  ].filter(Boolean);

  return (
    <div className="min-w-0 px-1 py-0.5 leading-tight">
      <div className="truncate text-[11px] font-semibold text-white">{title}</div>
      {details.length > 0 && (
        <div className="mt-0.5 flex min-w-0 flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] text-white/80">
          {details.map((detail, index) => (
            <span key={`${detail}-${index}`} className="max-w-full truncate">
              {detail}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function buildEventTooltip(job) {
  return [
    job.title || job.invoice || 'Job',
    job.status ? `Status: ${job.status}` : '',
    job.technician ? `Technician: ${job.technician}` : '',
    job.invoice ? `Invoice: ${job.invoice}` : '',
    job.phone ? `Phone: ${job.phone}` : '',
  ].filter(Boolean).join('\n');
}

function colorByStatus(s) {
  switch ((s || '').toLowerCase()) {
    case 'closed':      return { bg: '#64748B', border: '#475569' };
    case 'completed':   return { bg: '#34D399', border: '#10B981' };
    case 'in progress': return { bg: '#A855F7', border: '#7C3AED' };
    default:            return { bg: '#38BDF8', border: '#0EA5E9' };
  }
}
// put near your other helpers in Calendar.jsx
function formatSlotLabel(date) {
  const d = new Date(date);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, '0');
  return `${h}:${mm} ${ap}`;
}
