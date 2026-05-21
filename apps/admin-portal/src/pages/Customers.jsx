// src/pages/Customers.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../lib/api';

export default function Customers() {
  const nav = useNavigate();

  // data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // ui
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // form
  const blank = () => ({
    name: '',
    phone: '',
    address: '',
    suburb: '',
    customerId: '', // 5-digit
  });
  const [form, setForm] = useState(blank());

  // load
  async function load() {
    setLoading(true);
    setErr('');
    try {
      const data = await api('/customers');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // search + sort
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (items || [])
      .filter(c => {
        if (!qq) return true;
        const txt = [
          c.customerId, c.name, c.phone, c.address, c.suburb
        ].map(v => String(v || '').toLowerCase()).join(' ');
        return txt.includes(qq);
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [items, q]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...blank(),
      customerId: genUniqueId(new Set(items.map(c => String(c.customerId))))
    });
    setOpen(true);
  }
  function openEdit(c) {
    setEditingId(c._id);
    setForm({
      name: c.name || '',
      phone: c.phone || '',
      address: c.address || '',
      suburb: c.suburb || '',
      customerId: String(c.customerId || ''),
    });
    setOpen(true);
  }

  function genUniqueId(existing) {
    let id;
    do { id = String(Math.floor(10000 + Math.random() * 90000)); }
    while (existing.has(id));
    return id;
  }

  async function save() {
    console.log('Save function called');
    try {
      // simple client validation
      const cid = String(form.customerId || '').trim();
      const name = String(form.name || '').trim();

      if (!name) {
        alert('Name is required');
        return;
      }
      if (!/^\d{5}$/.test(cid)) {
        alert('Customer ID must be a 5-digit number');
        return;
      }

      // ensure uniqueness (client-side precheck; backend should also enforce)
      const exists = items.some(
        c => String(c.customerId) === cid && c._id !== editingId
      );
      if (exists) {
        alert('Customer ID already exists. Click Generate to get a new one.');
        return;
      }

      const payload = {
        name,
        phone: form.phone || '',
        address: form.address || '',
        suburb: form.suburb || '',
        customerId: cid,
      };

      if (editingId) {
        await api(`/customers/${editingId}`, { method: 'PUT', body: payload });
      } else {
        await api('/customers', { method: 'POST', body: payload });
      }

      // Add a small delay to prevent auto-closing issues
      setTimeout(() => {
        console.log('Closing modal after save');
        setOpen(false);
        setEditingId(null);
        setForm(blank());
      }, 100);
      
      await load();
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  }

  async function removeOne(id) {
    if (!confirm('Delete this customer?')) return;
    try {
      await api(`/customers/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  }

  function createJobFor(c) {
    nav('/app', {
      state: {
        newJobFor: {
          customerId: String(c.customerId || ''),
          customerName: c.name || '',
          phone: c.phone || '',
        }
      }
    });
  }

  return (
    <div className="page">
      <Header />

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Enhanced Customers Section */}
        <div className="bg-brand-panel rounded-3xl border border-brand-border overflow-hidden shadow-soft">
          <div className="bg-brand-bg px-4 py-5 sm:px-6 border-b border-brand-border">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex flex-wrap items-center gap-2">
                  <span className="text-4xl">👥</span>
                  Customers
                  <span className="badge badge-blue">
                    {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
                  </span>
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Search, maintain, and create jobs from customer records.
                </p>
              </div>

              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  className="input min-w-0 sm:w-72"
                  placeholder="Search customers..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>

              <button 
                className="btn btn-primary"
                onClick={openCreate}
              >
                <span className="text-xl">➕</span>
                New Customer
              </button>
            </div>
          </div>

          {loading && (
            <div className="m-4 rounded-2xl border border-brand-sky/20 bg-brand-sky/10 p-6 text-center sm:m-6">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-lg font-semibold text-white">Loading customers</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Loading customers...</p>
            </div>
          )}
          
          {err && (
            <div className="m-4 rounded-2xl border border-rose-400/35 bg-rose-500/10 p-6 text-center sm:m-6">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-white">Customers could not load</h3>
              <p className="mt-2 text-sm leading-6 text-rose-200">{err}</p>
            </div>
          )}

          {!loading && !err && (
            <>
              {filtered.length === 0 ? (
                <div className="m-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center sm:m-6">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Customers Found</h3>
                  <p className="text-sm leading-6 text-slate-400 mb-4">
                    {q.trim() ? 'No customers match your search criteria.' : 'Add your first customer to get started!'}
                  </p>
                  {!q.trim() && (
                    <button
                      onClick={openCreate}
                      className="btn btn-primary"
                    >
                      Add First Customer
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-brand-sky/10">
                  {filtered.map(customer => (
                    <div key={customer._id} className="p-8 hover:bg-gradient-to-r hover:from-brand-blue/5 hover:to-brand-sky/5 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        {/* Left Section - Customer Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-6 mb-4">
                            <div className="w-16 h-16 bg-brand-blue/20 rounded-2xl flex items-center justify-center text-2xl border border-brand-border shadow-soft">
                              👤
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white group-hover:text-brand-sky transition-colors">
                                {customer.name}
                              </h3>
                              <div className="flex items-center gap-6 text-sm text-text-secondary">
                                <span className="flex items-center gap-2">
                                  <span>🆔</span>
                                  Customer ID: {customer.customerId || 'Not assigned'}
                                </span>
                                {customer.phone && (
                                  <span className="flex items-center gap-2">
                                    <span>📞</span>
                                    {customer.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            {/* Customer ID Badge */}
                            <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-brand text-white border border-brand-blue/50 shadow-brand">
                              🆔 ID: {customer.customerId || 'Not assigned'}
                            </span>

                            {/* Suburb Badge */}
                            {customer.suburb && (
                              <span className="px-4 py-2 rounded-full text-sm font-bold bg-brand-teal/20 text-brand-green border border-brand-green/50 shadow-green">
                                📍 {customer.suburb}
                              </span>
                            )}
                          </div>

                          {/* Address */}
                          {customer.address && (
                            <div className="text-sm text-brand-sky/80 flex items-start gap-3">
                              <span className="text-lg">🏠</span>
                              <span>{customer.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-4 ml-8">
                          <div className="flex gap-3">
                            <button
                              onClick={() => createJobFor(customer)}
                              className="px-6 py-3 bg-brand-teal text-white border border-brand-green/50 rounded-2xl font-bold hover:bg-brand-teal/90 transition-all duration-200 flex items-center gap-3 shadow-green"
                            >
                              <span className="text-lg">🛠️</span>
                              Create Job
                            </button>
                            <button
                              onClick={() => openEdit(customer)}
                              className="px-6 py-3 bg-brand-sky text-brand-bg border border-brand-sky/50 rounded-2xl font-bold hover:bg-brand-sky/90 transition-all duration-200 flex items-center gap-3 shadow-sky"
                            >
                              <span className="text-lg">✏️</span>
                              Edit
                            </button>
                            <button
                              onClick={() => removeOne(customer._id)}
                              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-2xl font-bold transition-all duration-200 flex items-center gap-3 shadow-lg"
                            >
                              <span className="text-lg">🗑️</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={(e) => { 
            if (e.target === e.currentTarget) {
              console.log('Modal closed by backdrop click');
              // Comment out auto-close for now to prevent accidental closing
              // setOpen(false);
            }
          }}
          onKeyDown={(e) => {
            // Prevent accidental closing with Escape key - comment out for now
            if (e.key === 'Escape') {
              console.log('Escape key pressed - modal closing disabled');
              // setOpen(false);
            }
          }}
        >
          <div 
            className="w-full max-w-4xl rounded-2xl border border-brand-border max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#0c1450' }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border flex-shrink-0 rounded-t-2xl" style={{ backgroundColor: '#0c1450' }}>
              <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Customer' : 'New Customer'}</h3>
              <button onClick={() => {
                console.log('Modal closed by close button');
                setOpen(false);
              }} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                Close
              </button>
            </div>

            {/* scrollable content */}
            <div className="px-6 py-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30" style={{ backgroundColor: '#0c1450' }}>

              {/* Customer Information Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-brand-sky flex items-center gap-2">
                    <span>👤</span> Customer Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Name *">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
                      style={{ backgroundColor: '#0c1450' }}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
                      style={{ backgroundColor: '#0c1450' }}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="04xx xxx xxx"
                    />
                  </Field>

                  <Field label="Address" className="md:col-span-2">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
                      style={{ backgroundColor: '#0c1450' }}
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="123 Example St"
                    />
                  </Field>

                  <Field label="Suburb">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
                      style={{ backgroundColor: '#0c1450' }}
                      value={form.suburb}
                      onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))}
                      placeholder="Modbury"
                    />
                  </Field>

                  <Field label="Customer ID (5 digits)">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-3 py-2 rounded-lg border border-white/10 mt-1"
                        style={{ backgroundColor: '#0c1450' }}
                        value={form.customerId}
                        onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                        placeholder="e.g. 12345"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-sky border border-brand-sky/30 font-medium transition-colors mt-1"
                        onClick={() =>
                          setForm(f => ({
                            ...f,
                            customerId: genUniqueId(new Set(items.map(c => String(c.customerId))))
                          }))
                        }
                      >
                        Generate
                      </button>
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* sticky footer */}
            <div className="px-6 py-4 border-t border-brand-border rounded-b-2xl" style={{ backgroundColor: '#0c1450' }}>
              <div className="flex justify-between items-center">
                <div>
                  {/* Empty div for left side alignment */}
                </div>
                <div className="flex gap-3">
                  <button 
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200"
                    onClick={() => {
                      console.log('Modal closed by cancel button');
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 shadow-lg"
                    onClick={save}
                  >
                    {editingId ? 'Update Customer' : 'Create Customer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      {children}
    </label>
  );
}
