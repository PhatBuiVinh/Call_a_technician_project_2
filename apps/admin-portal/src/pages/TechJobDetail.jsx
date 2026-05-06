import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Shell from '../components/Shell';

// Valid status workflow for technicians
const STATUS_WORKFLOW = {
  'Assigned': { next: 'Accepted', label: 'Accept Job', color: 'btn-blue' },
  'Accepted': { next: 'En Route', label: 'Start Journey', color: 'btn-yellow' },
  'En Route': { next: 'On Site', label: 'Arrived On Site', color: 'btn-orange' },
  'On Site': { next: 'In Progress', label: 'Start Work', color: 'btn-pink' },
  'In Progress': { next: 'Completed', label: 'Complete Job', color: 'btn-green' }
};

const EMPTY_COMPLETION_FORM = {
  workPerformed: '',
  partsUsed: '',
  followUpRequired: false,
  followUpNotes: ''
};

export default function TechJobDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [isAdminOnlyNote, setIsAdminOnlyNote] = useState(false);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionForm, setCompletionForm] = useState(EMPTY_COMPLETION_FORM);
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState('');
  const [showRestoreDraftPrompt, setShowRestoreDraftPrompt] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState(null);

  const completionFormRef = useRef(completionForm);
  const lastDraftSerializedRef = useRef('');

  const draftStorageKey = `tech-completion-draft:${id}`;

  useEffect(() => {
    completionFormRef.current = completionForm;
  }, [completionForm]);

  function getDraftPayload(formData) {
    return {
      workPerformed: String(formData?.workPerformed || ''),
      partsUsed: String(formData?.partsUsed || ''),
      followUpRequired: Boolean(formData?.followUpRequired),
      followUpNotes: String(formData?.followUpNotes || ''),
      updatedAt: new Date().toISOString()
    };
  }

  function hasDraftContent(formData) {
    return Boolean(
      String(formData?.workPerformed || '').trim() ||
      String(formData?.partsUsed || '').trim() ||
      String(formData?.followUpNotes || '').trim() ||
      Boolean(formData?.followUpRequired)
    );
  }

  function clearCompletionDraft() {
    localStorage.removeItem(draftStorageKey);
    lastDraftSerializedRef.current = '';
    setDraftSavedAt('');
    setShowRestoreDraftPrompt(false);
    setDraftToRestore(null);
  }

  function handleRestoreDraft(restore) {
    if (!restore) {
      clearCompletionDraft();
      return;
    }

    if (!draftToRestore) {
      setShowRestoreDraftPrompt(false);
      return;
    }

    setCompletionForm({
      ...EMPTY_COMPLETION_FORM,
      workPerformed: String(draftToRestore.workPerformed || ''),
      partsUsed: String(draftToRestore.partsUsed || ''),
      followUpRequired: Boolean(draftToRestore.followUpRequired),
      followUpNotes: String(draftToRestore.followUpNotes || '')
    });

    if (draftToRestore.updatedAt) {
      setDraftSavedAt(draftToRestore.updatedAt);
    }

    setShowRestoreDraftPrompt(false);
    setDraftToRestore(null);
  }

  useEffect(() => {
    if (!showCompletionModal) return;

    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) {
        setShowRestoreDraftPrompt(false);
        setDraftToRestore(null);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!hasDraftContent(parsed)) {
        clearCompletionDraft();
        return;
      }

      setDraftToRestore(parsed);
      setShowRestoreDraftPrompt(true);
      lastDraftSerializedRef.current = raw;
      if (parsed.updatedAt) {
        setDraftSavedAt(parsed.updatedAt);
      }
    } catch {
      clearCompletionDraft();
    }
  }, [showCompletionModal, draftStorageKey]);

  useEffect(() => {
    if (!showCompletionModal) return;

    const interval = window.setInterval(() => {
      const currentForm = completionFormRef.current;
      if (!hasDraftContent(currentForm)) return;

      const payload = getDraftPayload(currentForm);
      const serialized = JSON.stringify(payload);

      if (serialized === lastDraftSerializedRef.current) return;

      localStorage.setItem(draftStorageKey, serialized);
      lastDraftSerializedRef.current = serialized;
      setDraftSavedAt(payload.updatedAt);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [showCompletionModal, draftStorageKey]);

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch job details from my-jobs endpoint (technician's assigned jobs)
      const jobs = await api('/my-jobs');
      const foundJob = jobs?.find(j => j._id === id);
      
      if (!foundJob) {
        setError('Job not found or access denied');
        setLoading(false);
        return;
      }
      
      setJob(foundJob);
      setNotes(foundJob.techNotes || []);
    } catch (err) {
      setError(err?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  async function handleStatusUpdate() {
    if (!job || !STATUS_WORKFLOW[job.status]) return;
    
    const nextStatus = STATUS_WORKFLOW[job.status].next;
    
    try {
      setActionLoading(true);
      await api(`/jobs/${id}/status`, {
        method: 'PUT',
        body: { status: nextStatus }
      });
      
      // Refresh job data
      await loadJob();
    } catch (err) {
      setError(err?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setNoteLoading(true);
      await api(`/jobs/${id}/tech-notes`, {
        method: 'POST',
        body: {
          note: newNote.trim(),
          isAdminOnly: isAdminOnlyNote
        }
      });

      setNewNote('');
      setIsAdminOnlyNote(false);
      await loadJob();
    } catch (err) {
      setError(err?.message || 'Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  }

  // Convert file to base64 for photo upload
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle photo selection
  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check total photo count (max 3)
    if (completionPhotos.length + files.length > 3) {
      setError('Maximum 3 photos allowed');
      return;
    }

    // Check file sizes (max 5MB each)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5MB)`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image`);
        return;
      }
    }

    try {
      setPhotoLoading(true);
      const base64Photos = await Promise.all(files.map(fileToBase64));
      setCompletionPhotos(prev => [...prev, ...base64Photos].slice(0, 3));
    } catch {
      setError('Failed to process photos');
    } finally {
      setPhotoLoading(false);
    }
  }

  // Remove a photo from selection
  function removePhoto(index) {
    setCompletionPhotos(prev => prev.filter((_, i) => i !== index));
  }

  // Submit completion form with status update
  async function handleCompleteJob(e) {
    e.preventDefault();

    // Validate required fields
    if (!completionForm.workPerformed.trim() || completionForm.workPerformed.trim().length < 10) {
      setError('Work performed is required (minimum 10 characters)');
      return;
    }
    if (completionForm.workPerformed.length > 2000) {
      setError('Work performed is too long (maximum 2000 characters)');
      return;
    }
    if (completionForm.followUpRequired && !completionForm.followUpNotes.trim()) {
      setError('Follow-up notes are required when follow-up is flagged');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      await api(`/jobs/${id}/status`, {
        method: 'PUT',
        body: {
          status: 'Completed',
          completionForm: {
            workPerformed: completionForm.workPerformed,
            partsUsed: completionForm.partsUsed,
            followUpRequired: completionForm.followUpRequired,
            followUpNotes: completionForm.followUpNotes
          },
          photos: completionPhotos
        }
      });

      clearCompletionDraft();

      // Reset and close modal
      setShowCompletionModal(false);
      setCompletionForm(EMPTY_COMPLETION_FORM);
      setCompletionPhotos([]);

      // Refresh job data
      await loadJob();
    } catch (err) {
      setError(err?.message || 'Failed to complete job');
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Assigned': return 'badge-blue';
      case 'Accepted': return 'badge-sky';
      case 'En Route': return 'badge-amber';
      case 'On Site': return 'badge-orange';
      case 'In Progress': return 'badge-fuchsia';
      case 'Completed': return 'badge-emerald';
      default: return 'badge-slate';
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'Low': return 'badge-slate';
      case 'Medium': return 'badge-amber';
      case 'High': return 'badge-orange';
      case 'Urgent': return 'badge-rose';
      default: return 'badge-neutral';
    }
  }

  if (loading) {
    return (
      <Shell title="Job Details" subtitle="Loading assigned job">
        <div className="text-center py-12 text-slate-400">Loading job...</div>
      </Shell>
    );
  }

  if (error && !job) {
    return (
      <Shell title="Job Details" subtitle="Unable to load this job">
        <div className="p-4 bg-rose-500/20 text-rose-300 rounded-xl mb-4">
          {error}
        </div>
        <button onClick={() => nav('/tech-view')} className="btn btn-ghost">
          Back to My Jobs
        </button>
      </Shell>
    );
  }

  if (!job) return null;

  const workflowStep = STATUS_WORKFLOW[job.status];
  const isCompleted = job.status === 'Completed';

  return (
    <Shell 
      title={job.title} 
      subtitle={isCompleted ? "Completed job - Read only" : "Review details and update progress"}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => nav(-1)} className="btn btn-ghost text-sm">
            ← Back
          </button>
          <div className="text-xs text-slate-400">{job.invoice || 'No invoice assigned'}</div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-3 px-4 py-3 bg-brand-teal/10 border border-brand-teal/30 rounded-xl">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-medium text-brand-teal">Completed Job</p>
              <p className="text-sm text-slate-400">
                {job.completionForm?.submittedAt 
                  ? `Completed on ${new Date(job.completionForm.submittedAt).toLocaleDateString()}`
                  : 'This job has been completed'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="surface p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`badge badge-lg ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            {job.priority && (
              <span className={`badge ${getPriorityColor(job.priority)}`}>
                Priority: {job.priority}
              </span>
            )}
            <span className="badge badge-neutral">
              {job.invoice || 'No invoice assigned'}
            </span>
          </div>

          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-white">{job.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {isCompleted ? 'Completed job - read only' : 'Review the details below, then take the next workflow action.'}
            </p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
              <div className="mt-1 space-y-1">
                <div className="font-semibold text-slate-100">{job.customerName || 'No customer name'}</div>
                <div className="text-slate-400">{job.phone || 'No phone'}</div>
                {job.customerEmail && <div className="text-slate-400">{job.customerEmail}</div>}
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Schedule</p>
              <div className="text-slate-200 mt-1">
                {formatDate(job.startAt)}
                {job.endAt && ` to ${formatDate(job.endAt)}`}
              </div>
            </div>

            <div className="rounded-xl bg-brand-blue/10 border border-brand-sky/20 p-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Service Address</p>
              <div className="text-slate-100 mt-1 leading-relaxed">{job.customerAddress || 'No address provided'}</div>
            </div>

            {job.description && (
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Job Description</p>
                <div className="text-slate-200 whitespace-pre-wrap mt-1">{job.description}</div>
              </div>
            )}

            {job.troubleshooting && (
              <div className="rounded-xl bg-brand-blue/10 border border-brand-blue/30 p-4 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">💡</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-sky mb-1">Troubleshooting Guidance</p>
                    <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {job.troubleshooting}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isCompleted && workflowStep && job.status !== 'In Progress' && (
          <div className="surface p-4 sm:p-5 rounded-2xl border-brand-sky/30 bg-brand-blue/10">
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-sky">Next Action</p>
              <h3 className="mt-1 text-lg font-semibold text-white">{workflowStep.label}</h3>
              <p className="mt-1 text-sm text-slate-300">
                Move this job from {job.status} to {workflowStep.next}.
              </p>
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={actionLoading}
              className={`btn ${workflowStep.color} w-full ${actionLoading ? 'opacity-60' : ''}`}
            >
              {actionLoading ? 'Updating...' : workflowStep.label}
              {!actionLoading && ` to ${workflowStep.next}`}
            </button>
          </div>
        )}

        {job.status === 'In Progress' && (
          <div className="surface p-4 sm:p-5 rounded-2xl border-emerald-400/30 bg-emerald-500/10">
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-200">Ready To Complete</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Completion Evidence</h3>
              <p className="mt-1 text-sm text-slate-300">Submit final work notes and optional photos before closing this task.</p>
            </div>
            <button
              onClick={() => setShowCompletionModal(true)}
              disabled={actionLoading}
              className="btn btn-green w-full"
            >
              Complete Job
            </button>
          </div>
        )}

        {isCompleted && job.completionForm?.submittedAt && (
          <div className="surface p-4 rounded-xl bg-green-500/10">
            <div className="flex items-center gap-2 text-green-300 mb-3">
              <span className="font-medium">Completion Summary</span>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">Work Performed:</span>
                <p className="text-slate-300 mt-1">{job.completionForm.workPerformed}</p>
              </div>
              {job.completionForm.partsUsed && (
                <div>
                  <span className="text-slate-400">Parts Used:</span>
                  <p className="text-slate-300 mt-1">{job.completionForm.partsUsed}</p>
                </div>
              )}
              {job.completionForm.followUpRequired && (
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <span className="text-amber-300 font-medium">Follow-up Required</span>
                  <p className="text-slate-300 mt-1">{job.completionForm.followUpNotes}</p>
                </div>
              )}
              {job.completionPhotos && job.completionPhotos.length > 0 && (
                <div>
                  <span className="text-slate-400">Photos ({job.completionPhotos.length}):</span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                    {job.completionPhotos.map((photo, idx) => (
                      <a
                        key={idx}
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 rounded-lg overflow-hidden border border-slate-600 hover:border-slate-400 transition"
                      >
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-slate-500 text-xs">
                Submitted: {formatDate(job.completionForm.submittedAt)}
              </p>
            </div>
          </div>
        )}

        <div className="surface p-4 sm:p-5 rounded-2xl">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Work Notes</h3>
              <p className="text-sm text-slate-400">
                {isCompleted ? 'Notes from when this job was active.' : 'Track progress details for internal reference.'}
              </p>
            </div>
            <span className="badge badge-neutral w-fit">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {notes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">
                No notes recorded
              </div>
            ) : (
              notes.map((note, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-sm border ${note.isAdminOnly ? 'bg-amber-500/10 border-amber-500/40' : 'bg-white/[0.03] border-white/10'}`}
                >
                  {note.isAdminOnly && (
                    <span className="badge badge-sm badge-amber mb-2">
                      Admin-Only
                    </span>
                  )}
                  <p className="text-slate-300">{note.note}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {!isCompleted && (
            <form onSubmit={handleAddNote} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a work note"
                className="input w-full text-sm bg-transparent"
                rows={2}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdminOnlyNote}
                    onChange={(e) => setIsAdminOnlyNote(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600"
                  />
                  Make this note admin-only
                </label>
                <button
                  type="submit"
                  disabled={noteLoading || !newNote.trim()}
                  className={`btn btn-primary text-sm ${noteLoading || !newNote.trim() ? 'opacity-60' : ''}`}
                >
                  {noteLoading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          )}
        </div>

        {showCompletionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50">
            <div className="surface w-full sm:max-w-lg sm:max-h-[90vh] h-[100dvh] sm:h-auto overflow-y-auto rounded-t-2xl sm:rounded-2xl p-4 sm:p-6">
              {/* Mobile header with close */}
              <div className="flex items-center justify-between gap-3 mb-4 sm:hidden">
                <div>
                  <h2 className="text-lg font-semibold">Complete Job</h2>
                  <p className="text-slate-400 text-xs truncate max-w-[200px]">{job.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  disabled={actionLoading}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Desktop header */}
              <div className="hidden sm:block">
                <h2 className="text-xl font-semibold mb-2">Complete Job</h2>
                <p className="text-slate-400 text-sm mb-6">{job.title}</p>
              </div>

              {showRestoreDraftPrompt && (
                <div className="mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
                  <p className="text-sm text-amber-200 mb-2">Restore previous draft?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost text-sm"
                      onClick={() => handleRestoreDraft(false)}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="btn btn-blue text-sm"
                      onClick={() => handleRestoreDraft(true)}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleCompleteJob} className="space-y-6">
                {/* Work Performed Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Work Performed <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Describe what you did to complete this job</p>
                  <textarea
                    value={completionForm.workPerformed}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, workPerformed: e.target.value }))}
                    placeholder="e.g., Replaced faulty thermostat, tested heating system, verified temperature control..."
                    className="input w-full text-base leading-relaxed"
                    rows={5}
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Minimum 10 characters</span>
                    <span className={`${completionForm.workPerformed.length > 1800 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {completionForm.workPerformed.length}/2000
                    </span>
                  </div>
                </div>

                {/* Parts/Materials Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Parts & Materials Used
                  </label>
                  <p className="text-xs text-slate-400">Optional - List any parts you installed or materials used</p>
                  <input
                    type="text"
                    value={completionForm.partsUsed}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, partsUsed: e.target.value }))}
                    placeholder="e.g., Honeywell T6 Pro Thermostat, 2x Wire connectors"
                    className="input w-full text-base py-3"
                    maxLength={500}
                  />
                </div>

                {/* Photos Section */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-white">
                      Evidence Photos
                    </label>
                    <p className="text-xs text-slate-400">Optional - Add up to 3 photos of completed work</p>
                  </div>

                  {completionPhotos.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {completionPhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-slate-600 group-hover:border-brand-sky/50 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full text-base flex items-center justify-center hover:bg-rose-600 shadow-lg active:scale-95 transition-transform"
                            aria-label="Remove photo"
                          >
                            ×
                          </button>
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                            {idx + 1}/3
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {completionPhotos.length < 3 && (
                    <label className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-600 rounded-xl cursor-pointer transition-colors border-2 border-dashed border-slate-500 hover:border-brand-sky/50">
                      <span className="text-xl">📷</span>
                      <span className="text-sm font-medium">{photoLoading ? 'Processing...' : 'Add Photo'}</span>
                      <span className="text-xs text-slate-400">({completionPhotos.length}/3)</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        disabled={photoLoading}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-xs text-slate-500">
                    Max 5MB each. JPEG or PNG. Tap to take a photo or choose from gallery.
                  </p>
                </div>

                {/* Follow-up Section */}
                <div className="pt-4 border-t border-slate-700/50 space-y-3">
                  <label className="flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={completionForm.followUpRequired}
                      onChange={(e) => setCompletionForm(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                      className="w-6 h-6 mt-0.5 rounded-lg border-slate-600 bg-slate-700 text-brand-teal focus:ring-brand-teal focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-semibold text-white block">Follow-up Required</span>
                      <span className="text-xs text-slate-400">Check if this job needs additional work or return visit</span>
                    </div>
                  </label>

                  {completionForm.followUpRequired && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm font-semibold text-amber-300">
                        Follow-up Details <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        value={completionForm.followUpNotes}
                        onChange={(e) => setCompletionForm(prev => ({ ...prev, followUpNotes: e.target.value }))}
                        placeholder="Describe what follow-up work is needed and when..."
                        className="input w-full text-base leading-relaxed border-amber-500/30 focus:border-amber-500/60"
                        rows={3}
                        required={completionForm.followUpRequired}
                        maxLength={1000}
                      />
                      <p className="text-xs text-slate-500">
                        Admin will be notified that follow-up is required.
                      </p>
                    </div>
                  )}
                </div>

                {/* Draft Status */}
                {draftSavedAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-lg">
                    <span>💾</span>
                    <span>Draft saved at {new Date(draftSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}

                {/* Action Buttons - Sticky on mobile */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:sticky sm:bottom-0 bg-[#0a0e27] sm:bg-transparent pb-safe">
                  <button
                    type="button"
                    onClick={() => setShowCompletionModal(false)}
                    disabled={actionLoading}
                    className="btn btn-ghost w-full sm:flex-1 py-3.5 text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-green w-full sm:flex-1 py-3.5 text-base font-semibold shadow-lg shadow-emerald-500/20"
                  >
                    {actionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Submitting...
                      </span>
                    ) : (
                      'Submit & Complete Job'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
