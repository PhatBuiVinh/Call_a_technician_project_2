import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomingJobsApi } from '../lib/api';
import Header from '../components/Header';

function toDisplayImageSrc(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';

  // Already a data URI
  if (s.startsWith('data:')) return s;

  // Absolute URL
  if (/^https?:\/\//i.test(s)) return s;

  // Relative path to backend
  if (s.startsWith('/')) {
    const origin = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:5000';
    return origin + s;
  }

  // Raw base64 (no prefix) -> assume JPEG
  const looksBase64 = /^[A-Za-z0-9+/=\s]+$/.test(s) && s.length > 100;
  if (looksBase64) return `data:image/jpeg;base64,${s.replace(/\s+/g, '')}`;

  // Fallback: try as-is
  return s;
}

function RequestStatusBadge({ job }) {
  if (job.convertedToJobId) {
    return <span className="badge badge-slate">Converted</span>;
  }

  if (job.status === 'In Progress') {
    return <span className="badge badge-amber">{job.status}</span>;
  }

  return <span className="badge badge-blue">{job.status}</span>;
}

export default function IncomingJobs() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [convertingId, setConvertingId] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch incoming jobs
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['incomingJobs', searchQuery],
    queryFn: () => incomingJobsApi.getIncomingJobs({ q: searchQuery }),
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (id) => incomingJobsApi.deleteIncomingJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingJobs'] });
      setSelectedJob(null);
    },
  });


  const handleConvertToJob = async (job) => {
    setConvertingId(job._id);
    try {
      const result = await incomingJobsApi.convertCheck(job._id);
      
      if (!result.canConvert) {
        if (result.convertedToJobId) {
          alert(`This request was already converted to a job.\n\nThe converted job ID is: ${result.convertedToJobId}\n\nYou can view it in the Dashboard.`);
        } else {
          alert(`Cannot convert: ${result.reason}`);
        }
        return;
      }
      
      // Prepare prefill data for Dashboard
      const prefillData = {
        customerName: job.fullName,
        phone: job.phone,
        customerEmail: job.email || '',
        description: job.description,
        title: job.description?.substring(0, 50) || 'New Job',
        _sourceRequestId: job._id
      };
      
      // Navigate to Dashboard with state
      navigate('/app', {
        state: {
          convertRequestId: job._id,
          prefillData
        }
      });
    } catch (error) {
      alert(`Unable to start conversion. Please try again or contact support if the problem persists.\n\nError: ${error.message}`);
    } finally {
      setConvertingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatJobId = (mongoId) => {
    // Convert MongoDB ObjectId to a readable job ID format
    // Example: 68f04830abc86ba6f9f1c631 -> JOB-2025-001
    const year = new Date().getFullYear();
    const shortId = mongoId.slice(-6); // Get last 6 characters
    const jobNumber = parseInt(shortId, 16) % 1000; // Convert to number and limit to 3 digits
    return `JOB-${year}-${String(jobNumber).padStart(3, '0')}`;
  };


  if (isLoading) return (
    <>
      <Header />
      <div className="min-h-[60vh] px-4 py-8">
        <div className="surface mx-auto max-w-2xl rounded-2xl border-brand-sky/20 bg-brand-sky/10 p-8 text-center">
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-brand-sky/70" />
          <h2 className="text-xl font-semibold text-white">Loading incoming jobs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Please wait while we fetch your data.
          </p>
        </div>
      </div>
    </>
  );
  
  if (error) return (
    <>
      <Header />
      <div className="min-h-[60vh] px-4 py-8">
        <div className="surface mx-auto max-w-2xl rounded-2xl border-rose-400/35 bg-rose-500/10 p-8 text-center">
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-rose-300/70" />
          <h2 className="text-xl font-semibold text-white">Error loading jobs</h2>
          <p className="mt-2 text-sm leading-6 text-rose-100">{error.message}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <section className="surface rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Incoming Job Requests</h1>
                <span className="badge badge-blue">
                  {jobs.length} {jobs.length === 1 ? 'request' : 'requests'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">Manage job requests from the marketing website.</p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input min-w-0 sm:w-80"
              />
            </div>
          </div>
        </section>

      {/* Jobs List */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table min-w-[960px]">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Request
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Images
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((job) => {
                const isConverted = Boolean(job.convertedToJobId);
                const primaryText = isConverted ? 'text-slate-200' : 'text-white';
                const secondaryText = isConverted ? 'text-slate-500' : 'text-slate-300';

                return (
                  <tr
                    key={job._id}
                    className={`${isConverted ? 'bg-white/[0.02]' : 'hover:bg-white/[0.04]'} transition-colors`}
                  >
                    <td className="py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`text-sm font-semibold ${primaryText}`}>{job.fullName}</div>
                          <RequestStatusBadge job={job} />
                        </div>
                        <div className={`text-xs ${secondaryText}`}>
                          Request ID <span className="font-mono">{formatJobId(job._id)}</span>
                        </div>
                        {isConverted && (
                          <div className="text-xs text-slate-500">
                            Converted{job.convertedAt ? ` ${formatDate(job.convertedAt)}` : ' to job'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 align-top">
                      <div className={`text-sm ${primaryText}`}>{job.phone}</div>
                      {job.email && (
                        <div className={`text-xs ${secondaryText}`}>{job.email}</div>
                      )}
                    </td>
                    <td className="py-4 align-top">
                      <p className={`text-sm ${isConverted ? 'text-slate-300' : 'text-slate-200'} line-clamp-2 max-w-xs`}>
                        {job.description}
                      </p>
                    </td>
                    <td className="py-4 align-top">
                      {job.images && job.images.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={toDisplayImageSrc(job.images[0])}
                            alt="Preview"
                            className={`h-12 w-12 rounded-lg object-cover ring-1 ring-white/10 shadow-sm ${isConverted ? 'opacity-80' : ''}`}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {job.images.length > 1 && (
                            <span className="badge badge-sm badge-slate">
                              +{job.images.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No images</span>
                      )}
                    </td>
                    <td className="py-4 align-top">
                      <div className={`text-sm ${primaryText}`}>{formatDate(job.createdAt)}</div>
                      <div className="text-xs text-slate-500">Submitted</div>
                    </td>
                    <td className="py-4 align-top">
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="btn btn-ghost text-sm"
                        >
                          View
                        </button>
                        {!job.convertedToJobId && (
                          <button
                            onClick={() => handleConvertToJob(job)}
                            disabled={convertingId === job._id}
                            className="btn btn-success text-sm"
                          >
                            {convertingId === job._id ? 'Checking...' : 'Convert to Job'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this job request?')) {
                              deleteJobMutation.mutate(job._id);
                            }
                          }}
                          className="btn btn-danger text-sm"
                          disabled={deleteJobMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {jobs.length === 0 && (
        <div className="panel p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-brand-sky/60" />
          <h2 className="text-lg font-semibold text-white">No incoming requests</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            No incoming job requests found.
          </p>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1450] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex flex-shrink-0 flex-col gap-4 border-b border-white/10 bg-white/[0.035] px-4 py-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <RequestStatusBadge job={selectedJob} />
                  <span className="badge badge-neutral font-mono">{formatJobId(selectedJob._id)}</span>
                </div>
                <h3 className="truncate text-2xl font-extrabold text-white">{selectedJob.fullName || 'Job Request Details'}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Incoming request submitted {formatDate(selectedJob.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="btn btn-ghost text-sm"
              >
                Close
              </button>
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 sm:px-6">

              {/* Customer Details Section */}
              <div className="surface mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-soft sm:p-5">
                <h4 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-base font-bold text-white">
                  <span>👤</span> Customer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Customer Name</label>
                    <div className="rounded-xl border border-white/10 bg-[#11195a] px-3 py-2.5 text-sm leading-6 text-slate-100">
                      {selectedJob.fullName}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</label>
                    <div className="rounded-xl border border-white/10 bg-[#11195a] px-3 py-2.5 text-sm leading-6 text-slate-100">
                      {selectedJob.phone}
                    </div>
                  </div>
                  {selectedJob.email && (
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
                      <div className="rounded-xl border border-white/10 bg-[#11195a] px-3 py-2.5 text-sm leading-6 text-slate-100">
                        {selectedJob.email}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Section */}
              <div className="surface mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-soft sm:p-5">
                <h4 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-base font-bold text-white">
                  <span>📝</span> Job Description
                </h4>
                <div className="min-h-24 whitespace-pre-wrap rounded-xl border border-white/10 bg-[#11195a] px-3 py-2.5 text-sm leading-6 text-slate-100">
                  {selectedJob.description}
                </div>
              </div>

              {/* Image Gallery Section */}
              {selectedJob.images && selectedJob.images.length > 0 && (() => {
                const displayImages = selectedJob.images
                  .map((img) => toDisplayImageSrc(img))
                  .filter(Boolean);

                if (!displayImages.length) {
                  return (
                    <div className="surface mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-soft sm:p-5">
                      <h4 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-base font-bold text-white">
                        <span>🖼️</span> Uploaded Images ({selectedJob.images.length})
                      </h4>
                      <p className="rounded-xl border border-white/10 bg-[#11195a] px-4 py-5 text-sm text-slate-300">Images were attached but could not be displayed.</p>
                    </div>
                  );
                }

                return (
                  <div className="surface mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-soft sm:p-5">
                    <h4 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-base font-bold text-white">
                      <span>🖼️</span> Uploaded Images ({displayImages.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {displayImages.map((src, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setLightboxImage(src)}
                          className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-1 text-left transition hover:border-brand-sky/50"
                          title="Click to enlarge"
                        >
                          <img
                            src={src}
                            alt={`Job image ${index + 1}`}
                            className="h-36 w-full rounded-lg object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {(!selectedJob.images || selectedJob.images.length === 0) && (
                <div className="surface mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-soft sm:p-5">
                  <h4 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-base font-bold text-white">
                    Uploaded Images (0)
                  </h4>
                  <p className="rounded-xl border border-white/10 bg-[#11195a] px-4 py-5 text-sm text-slate-300">
                    No images were attached to this request.
                  </p>
                </div>
              )}


              {/* Job Information Section */}
              <div className="surface rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-soft sm:p-5">
                <h4 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-base font-bold text-white">
                  <span>📋</span> Job Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted</label>
                    <div className="rounded-xl border border-white/10 bg-[#11195a] px-3 py-2.5 text-sm leading-6 text-slate-100">
                      {formatDate(selectedJob.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Request ID</label>
                    <div className="rounded-xl border border-white/10 bg-[#11195a] px-3 py-2.5 font-mono text-sm leading-6 text-slate-100">
                      {formatJobId(selectedJob._id)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Status Section - Show if converted */}
              {selectedJob.convertedToJobId && (
                <div className="surface mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 shadow-soft sm:p-5">
                  <h4 className="mb-4 flex items-center gap-2 border-b border-emerald-400/20 pb-3 text-base font-bold text-emerald-100">
                    <span>✓</span> Conversion Status
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-100/70">Status</label>
                      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold leading-6 text-emerald-100">
                        Successfully Converted to Job
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-100/70">Converted At</label>
                      <div className="rounded-xl border border-white/10 bg-[#11195a] px-3 py-2.5 text-sm leading-6 text-slate-100">
                        {selectedJob.convertedAt ? formatDate(selectedJob.convertedAt) : 'N/A'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/app');
                        setSelectedJob(null);
                      }}
                      className="btn btn-success w-full justify-center"
                    >
                      View Job in Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image lightbox (avoid opening a new tab) */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-2xl hover:text-slate-300 font-bold w-10 h-10 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
            aria-label="Close image"
          >
            ×
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged job attachment"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            loading="eager"
          />
        </div>
      )}
      </main>
    </>
  );
}
