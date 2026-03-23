// In local dev, prefer the Vite proxy by using API_BASE="/api".
// If you set VITE_API_BASE to a full URL (e.g. production), it will still work.
const API = import.meta.env.VITE_API_BASE || '/api';

async function handle(res) {
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { const j = JSON.parse(text); msg = j.message || j.error || text; } catch {}
    const err = new Error(`${res.status} ${res.statusText} – ${msg || "Request failed"}`);
    err.status = res.status; err.body = text; throw err;
  }
  try { return JSON.parse(text); } catch { return text; }
}

export const portal = {
  // Submit the "Request a Call" / contact inquiry to the backend (no auth).
  submitJobRequest: (body) =>
    fetch(`${API}/marketing/job-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),

  // Back-compat: older code may still call createPublicJob.
  createPublicJob: (body) =>
    fetch(`${API}/marketing/job-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
  health: () => fetch(`${API}/health`).then(handle),
};
