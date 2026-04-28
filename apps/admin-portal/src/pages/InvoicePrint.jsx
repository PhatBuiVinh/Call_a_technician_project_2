import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@callatech.com';

const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

export default function InvoicePrint() {
  const { id } = useParams();
  const nav = useNavigate();

  const [inv, setInv] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load invoice + any jobs that reference its number
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const one = await api(`/invoices/${id}`);
        setInv(one);

        try {
          const js = await api(`/jobs?invoice=${encodeURIComponent(one.number)}`);
          setJobs(Array.isArray(js) ? js : []);
        } catch {
          /* optional endpoint, ignore failures */
        }
      } catch (e) {
        setError(e.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Auto-print once the content is ready (single effect, top-level)
  useEffect(() => {
    if (!loading && inv) {
      const t = setTimeout(() => {
        try { window.print(); } catch {}
      }, 300); // small delay lets the browser layout first
      return () => clearTimeout(t);
    }
  }, [loading, inv]);

  if (loading) return <Page><p>Loading…</p></Page>;
  if (error)   return <Page><p className="text-red-400">{error}</p></Page>;
  if (!inv)    return <Page><p>Invoice not found.</p></Page>;

  const description = inv.description || inv.notes || '—';

  return (
    <Page>
      {/* hide in print */}
      <div className="no-print flex gap-2 mb-4">
        <button
          className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5"
          onClick={() => nav(-1)}
        >
          Back
        </button>
        <button
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
          onClick={() => window.print()}
        >
          Download PDF
        </button>
      </div>

      <div className="bg-white text-slate-900 p-6 rounded-xl shadow print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Invoice {inv.number}</h1>
            <p>Call a Technician</p>
            <p>{SUPPORT_EMAIL}</p>
            <p>+61 400 123 456</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Date</div>
            <div className="font-semibold">{new Date(inv.date || inv.createdAt).toLocaleDateString()}</div>
            <div className="mt-2 text-sm text-slate-500">Status</div>
            <div className="font-semibold">{inv.status}</div>
          </div>
        </div>

        <hr className="my-4" />

        {/* Bill to / amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Bill To</div>
            <div className="font-semibold">{inv.customer || '—'}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Amount</div>
            <div className="text-xl font-extrabold">{currency.format(inv.amount || 0)}</div>
          </div>
        </div>

        {/* Lines */}
        <table className="w-full text-sm mt-6">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2 whitespace-pre-wrap">{description}</td>
              <td className="py-2 text-right">{currency.format(inv.amount || 0)}</td>
            </tr>
          </tbody>
        </table>

        {/* Related jobs (optional) */}
        {jobs.length > 0 && (
          <>
            <h3 className="mt-6 mb-2 font-semibold">Jobs</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Title</th>
                  <th className="py-2">Technician</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id} className="border-t">
                    <td className="py-2">{j.title}</td>
                    <td className="py-2">{j.technician || '—'}</td>
                    <td className="py-2">{j.status}</td>
                    <td className="py-2">{new Date(j.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {inv.notes && !inv.description && (
          <>
            <h3 className="mt-6 mb-2 font-semibold">Notes</h3>
            <p className="whitespace-pre-wrap">{inv.notes}</p>
          </>
        )}

        <p className="mt-8 text-xs text-slate-500">Thank you for your business.</p>
      </div>

      {/* print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          html, body { background: #fff !important; }
        }
      `}</style>
    </Page>
  );
}

function Page({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 print:p-0">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
