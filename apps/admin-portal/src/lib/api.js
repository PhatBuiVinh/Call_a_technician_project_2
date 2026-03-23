// In local dev, prefer the Vite proxy by using BASE="/api" to avoid CORS/port drift.
// In production, set VITE_API_BASE to a full URL like "https://api.example.com/api".
const BASE = import.meta.env.VITE_API_BASE || '/api';

export function getToken(){
  // one source of truth
  return sessionStorage.getItem('cat_token') || localStorage.getItem('cat_token') || null;
}

export async function api(path, { method='GET', body, headers={} } = {}){
  const token = getToken();
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    const url = BASE + path;
    const detail = e?.message ? ` (${e.message})` : '';
    throw new Error(`Network error calling API: ${url}${detail}`);
  }

  const text = await res.text();
  let data = null; try{ data = text ? JSON.parse(text) : null }catch{}
  if(!res.ok) throw new Error((data && (data.error || data.message)) || res.statusText);
  return data;
}

// API functions for incoming job requests
export const incomingJobsApi = {
  getIncomingJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api(`/incoming-jobs${queryString ? '?' + queryString : ''}`);
  },
  getIncomingJob: (id) => api(`/incoming-jobs/${id}`),
  updateIncomingJob: (id, data) => api(`/incoming-jobs/${id}`, { method: 'PUT', body: data }),
  deleteIncomingJob: (id) => api(`/incoming-jobs/${id}`, { method: 'DELETE' }),
};