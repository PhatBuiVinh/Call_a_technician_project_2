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
      <div className="loading-container">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading incoming jobs...</div>
          <div className="text-sm text-gray-400">Please wait while we fetch your data</div>
        </div>
      </div>
    </>
  );
  
  if (error) return (
    <>
      <Header />
      <div className="loading-container">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-red-400">Error loading jobs</div>
          <div className="text-sm text-gray-400">{error.message}</div>
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
          <table className="table">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Images
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td className="py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{job.fullName}</div>
                    {job.convertedToJobId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 mt-1">
                        <span className="mr-1">✓</span> Converted to Job
                      </span>
                    ) : job.status === 'In Progress' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 mt-1">
                        <span className="mr-1">⏳</span> {job.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 mt-1">
                        <span className="mr-1">●</span> {job.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <div className="text-sm text-white">{job.phone}</div>
                    {job.email && (
                      <div className="text-sm text-slate-300">{job.email}</div>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="text-sm text-white max-w-xs truncate">
                      {job.description}
                    </div>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    {job.images && job.images.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <img 
                          src={toDisplayImageSrc(job.images[0])} 
                          alt="Preview" 
                          className="w-10 h-10 object-cover rounded border border-white/20"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {job.images.length > 1 && (
                          <span className="text-xs text-white bg-white/10 px-2 py-1 rounded">
                            +{job.images.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No images</span>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap text-sm text-slate-300">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-sky border border-brand-sky/30 font-medium transition-all duration-200 flex items-center gap-2"
                      >
                        <span>👁️</span>
                        View
                      </button>
                      {job.convertedToJobId ? (
                        <button
                          onClick={() => {
                            // Navigate to Dashboard - the job will be visible in the jobs list
                            navigate('/app');
                          }}
                          className="px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 font-medium transition-all duration-200 flex items-center gap-2"
                        >
                          <span>�️</span>
                          View Job
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConvertToJob(job)}
                          disabled={convertingId === job._id}
                          className="px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>🔄</span>
                          {convertingId === job._id ? 'Checking...' : 'Convert to Job'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this job request?')) {
                            deleteJobMutation.mutate(job._id);
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                        disabled={deleteJobMutation.isPending}
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No incoming job requests found.</p>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div 
            className="w-full max-w-4xl rounded-2xl border border-brand-border max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#0c1450' }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border flex-shrink-0 rounded-t-2xl" style={{ backgroundColor: '#0c1450' }}>
              <h3 className="text-xl font-bold text-white">Job Request Details</h3>
              <button 
                onClick={() => setSelectedJob(null)} 
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>

            {/* scrollable content */}
            <div className="px-6 py-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30" style={{ backgroundColor: '#0c1450' }}>

              {/* Customer Details Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <h4 className="text-lg font-semibold text-brand-sky flex items-center gap-2 mb-4">
                  <span>👤</span> Customer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Customer Name</label>
                    <div className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm" style={{ backgroundColor: '#0c1450' }}>
                      {selectedJob.fullName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                    <div className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm" style={{ backgroundColor: '#0c1450' }}>
                      {selectedJob.phone}
                    </div>
                  </div>
                  {selectedJob.email && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                      <div className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm" style={{ backgroundColor: '#0c1450' }}>
                        {selectedJob.email}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <h4 className="text-lg font-semibold text-brand-sky flex items-center gap-2 mb-4">
                  <span>📝</span> Job Description
                </h4>
                <div className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm" style={{ backgroundColor: '#0c1450' }}>
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
                    <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                      <h4 className="text-lg font-semibold text-brand-sky flex items-center gap-2 mb-4">
                        <span>🖼️</span> Uploaded Images ({selectedJob.images.length})
                      </h4>
                      <p className="text-sm text-slate-300">Images were attached but could not be displayed.</p>
                    </div>
                  );
                }

                return (
                  <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                    <h4 className="text-lg font-semibold text-brand-sky flex items-center gap-2 mb-4">
                      <span>🖼️</span> Uploaded Images ({displayImages.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {displayImages.map((src, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setLightboxImage(src)}
                          className="block text-left"
                          title="Click to enlarge"
                        >
                          <img
                            src={src}
                            alt={`Job image ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-white/20 cursor-pointer hover:border-brand-sky transition"
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


              {/* Job Information Section */}
              <div className="rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <h4 className="text-lg font-semibold text-brand-sky flex items-center gap-2 mb-4">
                  <span>📋</span> Job Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Submitted</label>
                    <div className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm" style={{ backgroundColor: '#0c1450' }}>
                      {formatDate(selectedJob.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Request ID</label>
                    <div className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm font-mono" style={{ backgroundColor: '#0c1450' }}>
                      {formatJobId(selectedJob._id)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Status Section - Show if converted */}
              {selectedJob.convertedToJobId && (
                <div className="mt-6 rounded-2xl p-6 border border-green-500/30 bg-green-500/10">
                  <h4 className="text-lg font-semibold text-green-300 flex items-center gap-2 mb-4">
                    <span>✓</span> Conversion Status
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                      <div className="px-3 py-2 rounded-lg border border-green-500/30 text-green-300 text-sm font-medium">
                        Successfully Converted to Job
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Converted At</label>
                      <div className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm">
                        {selectedJob.convertedAt ? formatDate(selectedJob.convertedAt) : 'N/A'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/app');
                        setSelectedJob(null);
                      }}
                      className="mt-2 px-4 py-2 rounded-lg bg-green-600/30 hover:bg-green-600/50 text-green-300 border border-green-500/30 font-medium transition-all duration-200 flex items-center gap-2 w-full justify-center"
                    >
                      <span>👁️</span> View Job in Dashboard
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
