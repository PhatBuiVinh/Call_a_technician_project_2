import { useState, useEffect, useCallback } from 'react';
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

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionForm, setCompletionForm] = useState({
    workPerformed: '',
    partsUsed: '',
    followUpRequired: false,
    followUpNotes: ''
  });
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);

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
        body: { note: newNote.trim() }
      });

      setNewNote('');
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
    } catch (err) {
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

      // Reset and close modal
      setShowCompletionModal(false);
      setCompletionForm({
        workPerformed: '',
        partsUsed: '',
        followUpRequired: false,
        followUpNotes: ''
      });
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
      case 'Assigned': return 'bg-blue-500/20 text-blue-300';
      case 'Accepted': return 'bg-purple-500/20 text-purple-300';
      case 'En Route': return 'bg-yellow-500/20 text-yellow-300';
      case 'On Site': return 'bg-orange-500/20 text-orange-300';
      case 'In Progress': return 'bg-pink-500/20 text-pink-300';
      case 'Completed': return 'bg-green-500/20 text-green-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  }

  if (loading) {
    return (
      <Shell title="Job Details">
        <div className="text-center py-12 text-slate-400">Loading job...</div>
      </Shell>
    );
  }

  if (error && !job) {
    return (
      <Shell title="Job Details">
        <div className="p-4 bg-rose-500/20 text-rose-300 rounded-xl mb-4">
          {error}
        </div>
        <button onClick={() => nav('/tech-view')} className="btn btn-ghost">
          ← Back to My Jobs
        </button>
      </Shell>
    );
  }

  if (!job) return null;

  const workflowStep = STATUS_WORKFLOW[job.status];
  const isCompleted = job.status === 'Completed';

  return (
    <Shell title={job.title}>
      <div className="space-y-4">
        {/* Back button */}
        <button onClick={() => nav('/tech-view')} className="btn btn-ghost text-sm">
          ← Back to My Jobs
        </button>

        {error && (
          <div className="p-3 bg-rose-500/20 text-rose-300 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Job Info Card */}
        <div className="surface p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            <span className="text-slate-400 text-sm">{job.invoice}</span>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-slate-500">👤</span>
              <div>
                <div className="text-slate-300">{job.customerName || 'No customer name'}</div>
                <div className="text-slate-500">{job.phone || 'No phone'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-slate-500">📍</span>
              <div className="text-slate-300">{job.customerAddress || 'No address'}</div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-slate-500">🕐</span>
              <div className="text-slate-300">
                {formatDate(job.startAt)}
                {job.endAt && ` → ${formatDate(job.endAt)}`}
              </div>
            </div>

            {job.description && (
              <div className="flex items-start gap-3 mt-2">
                <span className="text-slate-500">📝</span>
                <div className="text-slate-300 whitespace-pre-wrap">{job.description}</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {!isCompleted && workflowStep && job.status !== 'In Progress' && (
          <div className="surface p-4 rounded-xl">
            <h3 className="font-medium mb-3">Update Status</h3>
            <button
              onClick={handleStatusUpdate}
              disabled={actionLoading}
              className={`btn ${workflowStep.color} w-full ${actionLoading ? 'opacity-60' : ''}`}
            >
              {actionLoading ? 'Updating...' : workflowStep.label}
              {!actionLoading && ` → ${workflowStep.next}`}
            </button>
          </div>
        )}

        {/* Complete Job Button - opens completion modal */}
        {job.status === 'In Progress' && (
          <div className="surface p-4 rounded-xl">
            <h3 className="font-medium mb-3">Update Status</h3>
            <button
              onClick={() => setShowCompletionModal(true)}
              disabled={actionLoading}
              className="btn btn-green w-full"
            >
              Complete Job →
            </button>
          </div>
        )}

        {/* Completion Summary - shown after job is completed */}
        {isCompleted && job.completionForm && (
          <div className="surface p-4 rounded-xl bg-green-500/10">
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <span>✅</span>
              <span className="font-medium">Job Completed</span>
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
                  <span className="text-amber-400 font-medium">⚠️ Follow-up Required</span>
                  <p className="text-slate-300 mt-1">{job.completionForm.followUpNotes}</p>
                </div>
              )}
              {job.completionPhotos && job.completionPhotos.length > 0 && (
                <div>
                  <span className="text-slate-400">Photos ({job.completionPhotos.length}):</span>
                  <div className="flex gap-2 mt-2">
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

        {/* Simple completed indicator (no form submitted) */}
        {isCompleted && !job.completionForm && (
          <div className="surface p-4 rounded-xl bg-green-500/10">
            <div className="flex items-center gap-2 text-green-400">
              <span>✅</span>
              <span>Job completed</span>
            </div>
          </div>
        )}

        {/* Tech Notes */}
        <div className="surface p-4 rounded-xl">
          <h3 className="font-medium mb-3">Technician Notes</h3>
          
          {/* Existing Notes */}
          <div className="space-y-2 mb-4">
            {notes.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No notes yet</p>
            ) : (
              notes.map((note, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg text-sm">
                  <p className="text-slate-300">{note.note}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Note Form - hidden for completed jobs */}
          {!isCompleted && (
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="input w-full text-sm"
                rows={2}
              />
              <button
                type="submit"
                disabled={noteLoading || !newNote.trim()}
                className={`btn btn-primary text-sm ${noteLoading || !newNote.trim() ? 'opacity-60' : ''}`}
              >
                {noteLoading ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          )}
        </div>

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="surface w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Complete Job</h2>
              <p className="text-slate-400 text-sm mb-4">{job.title}</p>

              <form onSubmit={handleCompleteJob} className="space-y-4">
                {/* Work Performed */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Work Performed <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={completionForm.workPerformed}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, workPerformed: e.target.value }))}
                    placeholder="Describe what work was performed..."
                    className="input w-full"
                    rows={4}
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Minimum 10 characters, maximum 2000
                  </p>
                </div>

                {/* Parts Used */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parts/Materials Used <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={completionForm.partsUsed}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, partsUsed: e.target.value }))}
                    placeholder="List any parts or materials used..."
                    className="input w-full"
                    maxLength={500}
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Evidence Photos <span className="text-slate-500">(optional, max 3)</span>
                  </label>

                  {/* Photo Previews */}
                  {completionPhotos.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {completionPhotos.map((photo, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-rose-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Photo Button */}
                  {completionPhotos.length < 3 && (
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition">
                      <span>📷</span>
                      <span className="text-sm">{photoLoading ? 'Processing...' : 'Add Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        disabled={photoLoading}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-slate-500 text-xs mt-1">
                    Max 5MB per photo. JPEG, PNG accepted.
                  </p>
                </div>

                {/* Follow-up Required */}
                <div className="pt-2 border-t border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={completionForm.followUpRequired}
                      onChange={(e) => setCompletionForm(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600"
                    />
                    <span className="text-sm font-medium">Follow-up Required</span>
                  </label>

                  {completionForm.followUpRequired && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">
                        Follow-up Notes <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        value={completionForm.followUpNotes}
                        onChange={(e) => setCompletionForm(prev => ({ ...prev, followUpNotes: e.target.value }))}
                        placeholder="Describe what follow-up is needed..."
                        className="input w-full"
                        rows={2}
                        required={completionForm.followUpRequired}
                        maxLength={1000}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCompletionModal(false)}
                    disabled={actionLoading}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-green flex-1"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit & Complete Job'}
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
