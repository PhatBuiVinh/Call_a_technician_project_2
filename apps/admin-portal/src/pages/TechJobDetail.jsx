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
        {!isCompleted && workflowStep && (
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

        {isCompleted && (
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
      </div>
    </Shell>
  );
}
