// src/pages/Invoices.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../lib/api';

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
});

function InvoiceStatusBadge({ status }) {
  const styles = {
    Unpaid: 'badge-amber',
    Pending: 'badge-sky',
    Paid: 'badge-emerald',
    Overdue: 'badge-rose',
    Void: 'badge-slate',
  };

  return (
    <span className={`badge ${styles[status] || 'badge-slate'}`}>
      {status || 'Unpaid'}
    </span>
  );
}

// Pricing rules
const BASE_PRICE = 165; // fixed, covers up to 2 hours
const EXTRA_PRICE = {
  0:   0,
  15:  20.625,
  30:  41.25,
  45:  61.875,
  60:  82.5,
};

export default function Invoices() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // data
  const [invoices, setInvoices] = useState([]);

  // ui
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // modal
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank());

  // filters (read ?q= from URL so Dashboard can prefill)
  const initialQ = searchParams.get('q') || '';
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState('All');

  function blank() {
    return {
      number: '',
      customer: '',
      // Enhanced customer details
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      // Job details
      jobTitle: '',
      jobDescription: '',
      // pricing
      fixedPrice: BASE_PRICE,
      additionalMins: 0,                // 0 | 15 | 30 | 45 | 60
      amount: BASE_PRICE,               // derived total = base + extra
      // Software
      software: [],
      newSoftwareName: '',
      newSoftwareValue: '',
      // Discounts
      pensionYearDiscount: false,
      socialMediaDiscount: false,
      // other
      status: 'Unpaid',
      date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      description: '',
    };
  }

  // Enhanced pricing calculation to match dashboard
  const PRICE_PER_15_MIN = 20.625; // $20.625 per 15 minutes
  
  // Calculate extra price for any number of minutes
  const getExtraPrice = (minutes) => {
    return Math.round((minutes / 15) * PRICE_PER_15_MIN * 100) / 100;
  };

  // derived total (single source of truth for UI display)
  const totalAmount = useMemo(() => {
    const softwareTotal = (form.software || []).reduce((sum, item) => sum + (item.value || 0), 0);
    const additionalTimePrice = getExtraPrice(form.additionalMins || 0);
    const timePrice = BASE_PRICE + additionalTimePrice;
    let total = timePrice + softwareTotal;

    if (form.pensionYearDiscount) total *= 0.9;
    if (form.socialMediaDiscount) total *= 0.95;

    return total;
  }, [form.additionalMins, form.software, form.pensionYearDiscount, form.socialMediaDiscount]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/invoices');
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // keep ?q in URL synced to the input
  useEffect(() => {
    if (q) searchParams.set('q', q);
    else searchParams.delete('q');
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return invoices.filter(inv => {
      const match =
        !qq ||
        [inv.number, inv.customer, inv.notes, inv.description]
          .some(v => (v || '').toLowerCase().includes(qq));
      const sOk = status === 'All' || inv.status === status;
      return match && sOk;
    });
  }, [invoices, q, status]);

  const kpi = useMemo(() => {
    const total = filtered.length;
    const unpaid = filtered
      .filter(i => i.status === 'Unpaid')
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const paid = filtered
      .filter(i => i.status === 'Paid')
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const overdue = filtered.filter(i => i.status === 'Overdue').length;
    return { total, unpaid, paid, overdue };
  }, [filtered]);

  function openCreate() {
    setEditingId(null);
    setForm(blank());
    setOpen(true);
  }

  function openEdit(inv) {
    setEditingId(inv._id);
    const add = Number(inv?.additionalMins ?? 0);
    const computedAmount =
      typeof inv?.amount === 'number'
        ? inv.amount
        : BASE_PRICE + (EXTRA_PRICE[add] ?? 0);

    setForm({
      number: inv.number || '',
      customer: inv.customer || '',
      // Enhanced customer details
      customerId: inv.customerId || '',
      customerName: inv.customerName || inv.customer || '',
      customerPhone: inv.customerPhone || '',
      customerEmail: inv.customerEmail || '',
      customerAddress: inv.customerAddress || '',
      // Job details
      jobTitle: inv.jobTitle || '',
      jobDescription: inv.jobDescription || '',
      fixedPrice: BASE_PRICE,
      additionalMins: add,
      amount: computedAmount, // derived total
      // Software
      software: inv.software || [],
      // Discounts
      pensionYearDiscount: inv.pensionYearDiscount || false,
      socialMediaDiscount: inv.socialMediaDiscount || false,
      status: inv.status || 'Unpaid',
      date: (inv.date ? new Date(inv.date) : new Date()).toISOString().slice(0, 10),
      description: inv.description || inv.notes || '',
    });
    setOpen(true);
  }

  async function save() {
    // 1) Compute final amount using enhanced pricing calculation
    const additionalMins = Number(form.additionalMins || 0);
    const softwareTotal = (form.software || []).reduce((sum, item) => sum + (item.value || 0), 0);
    const additionalTimePrice = getExtraPrice(additionalMins);
    const timePrice = BASE_PRICE + additionalTimePrice;
    let amount = timePrice + softwareTotal;

    if (form.pensionYearDiscount) amount *= 0.9;
    if (form.socialMediaDiscount) amount *= 0.95;

    // 2) Build payload (map UI 'description' -> backend 'notes')
    const payload = {
      ...form,
      fixedPrice: BASE_PRICE,
      additionalMins,
      amount,
      notes: form.description,
      date: form.date ? new Date(form.date) : new Date(),
      // Include all enhanced customer and job details
      customerId: form.customerId,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      customerAddress: form.customerAddress,
      jobTitle: form.jobTitle,
      jobDescription: form.jobDescription,
      software: form.software || [],
      pensionYearDiscount: form.pensionYearDiscount || false,
      socialMediaDiscount: form.socialMediaDiscount || false,
    };
    delete payload.description;

    try {
      // 3) Create / Update the invoice
      if (editingId) {
        await api(`/invoices/${editingId}`, { method: 'PUT', body: payload });
      } else {
        await api('/invoices', { method: 'POST', body: payload });
      }

      // 4) Sync related job duration & amount (if any)
      try {
        if (payload.number) {
          // find job that references this invoice number
          const jobs = await api(`/jobs?invoice=${encodeURIComponent(payload.number)}`).catch(() => []);
          const j = Array.isArray(jobs) ? jobs[0] : null;

          if (j && j.startAt) {
            // base durationMins (fallback to 120 = 2h if not present)
            const base = Number(j.durationMins || 120);
            const extra = Number(payload.additionalMins || 0);

            // new end time = start + base + extra
            const start = new Date(j.startAt);
            start.setMinutes(start.getMinutes() + base + extra);
            const newEndISO = start.toISOString();

            await api(`/jobs/${j._id}`, {
              method: 'PUT',
              body: {
                endAt: newEndISO,
                durationMins: base,
                additionalMins: extra,
                amount: payload.amount, // keep job amount aligned with invoice
                // Sync customer details
                customerName: payload.customerName || payload.customer,
                customerId: payload.customerId,
                phone: payload.customerPhone,
                customerEmail: payload.customerEmail,
                customerAddress: payload.customerAddress,
                // Sync job details
                title: payload.jobTitle,
                description: payload.jobDescription,
                // Sync software and discounts
                software: payload.software || [],
                pensionYearDiscount: payload.pensionYearDiscount || false,
                socialMediaDiscount: payload.socialMediaDiscount || false,
              },
            });
          }
        }
      } catch {
        // swallow sync errors – invoice save should still succeed
      }

      // 5) Reset modal + refresh list
      setOpen(false);
      setEditingId(null);
      setForm(blank());
      await load();
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  }

  async function remove(id) {
    if (!confirm('Delete this invoice?')) return;
    try {
      await api(`/invoices/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  }

  return (
    <div className="page">
      <Header />

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Enhanced KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-brand-panel rounded-3xl p-6 border border-brand-border shadow-soft">
            <div className="text-brand-sky text-sm font-medium mb-2">Total Invoices</div>
            <div className="text-3xl font-bold text-white">{kpi.total}</div>
          </div>
          <div className="bg-brand-panel rounded-3xl p-6 border border-brand-border shadow-soft">
            <div className="text-brand-green text-sm font-medium mb-2">Unpaid Total</div>
            <div className="text-3xl font-bold text-white">{currency.format(kpi.unpaid)}</div>
          </div>
          <div className="bg-brand-panel rounded-3xl p-6 border border-brand-border shadow-soft">
            <div className="text-brand-sky text-sm font-medium mb-2">Paid Total</div>
            <div className="text-3xl font-bold text-white">{currency.format(kpi.paid)}</div>
          </div>
          <div className="bg-brand-panel rounded-3xl p-6 border border-brand-border shadow-soft">
            <div className="text-red-400 text-sm font-medium mb-2">Overdue Count</div>
            <div className="text-3xl font-bold text-white">{kpi.overdue}</div>
          </div>
        </section>

        {/* Enhanced Invoices Section */}
        <div className="bg-brand-panel rounded-3xl border border-brand-border overflow-hidden shadow-soft">
          <div className="bg-brand-bg px-8 py-6 border-b border-brand-border">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
              <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                Invoices
                <span className="badge badge-lg badge-blue">
                  {filtered.length} {filtered.length === 1 ? 'invoice' : 'invoices'}
                </span>
              </h2>

              <div className="flex-1 flex flex-col sm:flex-row gap-3 min-w-0">
              <input
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-text-primary placeholder-text-muted focus:border-brand-border-hover focus:ring-2 focus:ring-brand-border/30 backdrop-blur-sm min-w-0"
                  placeholder="Search invoices..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />

              <select
                  className="px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-text-primary focus:border-brand-border-hover focus:ring-2 focus:ring-brand-border/30 backdrop-blur-sm min-w-[120px]"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {['All', 'Unpaid', 'Paid', 'Overdue', 'Void'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                <button 
                  className="px-6 py-3 bg-brand-teal hover:bg-brand-teal/90 text-text-primary rounded-xl font-medium transition-all duration-200 shadow-soft flex items-center justify-center gap-2 whitespace-nowrap"
                  onClick={openCreate}
                >
                  New Invoice
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="p-8 text-center">
              <p className="text-slate-300">Loading invoices...</p>
            </div>
          )}
          
          {error && (
            <div className="p-8 text-center">
              <p className="text-rose-300">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="table text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Number</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv._id}>
                      <td className="py-2 font-semibold">
                        {/* Click number → print view (same tab) */}
                        <button
                          className="underline text-brand-psky"
                          onClick={() => nav(`/invoices/${inv._id}/print`)}
                          title="Open print view"
                        >
                          {inv.number}
                        </button>
                      </td>
                      <td className="py-2">
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {inv.customerName || inv.customer || '—'}
                          </div>
                          {inv.customerPhone && (
                            <div className="text-xs text-slate-300">
                              Phone: {inv.customerPhone}
                            </div>
                          )}
                          {inv.customerEmail && (
                            <div className="text-xs text-slate-300">
                              Email: {inv.customerEmail}
                            </div>
                          )}
                          {inv.customerAddress && (
                            <div className="text-xs text-slate-300 max-w-xs truncate">
                              Address: {inv.customerAddress}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        {currency.format(Number(inv.amount) || 0)}
                      </td>
                      <td className="py-2">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="py-2">
                        {new Date(inv.date || inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 rounded-lg bg-brand-sky/20 hover:bg-brand-sky/30 text-brand-sky border border-brand-sky/30 font-medium transition-all duration-200 flex items-center gap-2"
                            onClick={() => openEdit(inv)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/50 font-medium transition-colors flex items-center gap-2 shadow-lg"
                            onClick={() => remove(inv._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-300">
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setOpen(false);
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
              <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Invoice' : 'New Invoice'}</h3>
              <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                Close
              </button>
            </div>

            {/* scrollable content */}
            <div className="px-6 py-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30" style={{ backgroundColor: '#0c1450' }}>

              {/* Invoice Details Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-brand-sky">Invoice Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                    label="Invoice Number *"
                value={form.number}
                onChange={v => setForm(f => ({ ...f, number: v }))}
                placeholder="INV-1201"
              />
              <Field
                    label="Date *"
                    type="date"
                    value={form.date}
                    onChange={v => setForm(f => ({ ...f, date: v }))}
                  />
                  <Select
                    label="Status"
                    value={form.status}
                    onChange={v => setForm(f => ({ ...f, status: v }))}
                    options={['Unpaid', 'Paid', 'Overdue', 'Void', 'Pending']}
                  />
                  <Field
                    label="Description"
                    type="textarea"
                    value={form.description}
                    onChange={v => setForm(f => ({ ...f, description: v }))}
                    placeholder="Invoice notes..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Customer Details Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-brand-sky">Customer Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Customer Name *"
                    value={form.customerName || form.customer}
                    onChange={v => setForm(f => ({ ...f, customerName: v, customer: v }))}
                    placeholder="Customer name"
                  />
                  <Field
                    label="Customer ID"
                    value={form.customerId}
                    onChange={v => setForm(f => ({ ...f, customerId: v }))}
                    placeholder="10000"
                  />
                  <Field
                    label="Phone Number *"
                    value={form.customerPhone}
                    onChange={v => setForm(f => ({ ...f, customerPhone: v }))}
                    placeholder="0412345678"
                  />
                  <Field
                    label="Email"
                    value={form.customerEmail}
                    onChange={v => setForm(f => ({ ...f, customerEmail: v }))}
                    placeholder="customer@example.com"
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Address"
                      value={form.customerAddress}
                      onChange={v => setForm(f => ({ ...f, customerAddress: v }))}
                      placeholder="Customer address"
                    />
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-lg font-semibold mb-4 text-brand-blue">Job Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Job Title *"
                    value={form.jobTitle}
                    onChange={v => setForm(f => ({ ...f, jobTitle: v }))}
                    placeholder="Computer repair service"
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Job Description"
                      type="textarea"
                      value={form.jobDescription}
                      onChange={v => setForm(f => ({ ...f, jobDescription: v }))}
                      placeholder="Detailed description of work performed..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-lg font-semibold mb-4 text-brand-blue">Pricing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Base Time">
                <input className="input mt-1" value="2 hours" readOnly />
              </Field>
                  <Field label="Base Price (covers up to 2 hrs)">
                <input className="input mt-1" value={currency.format(BASE_PRICE)} readOnly />
              </Field>
              <Select
                label="Additional Time Taken"
                value={form.additionalMins}
                onChange={v => setForm(f => ({
                  ...f,
                  additionalMins: Number(v),
                }))}
                options={[
                  { value: 0,   label: 'None (+$0.00)' },
                      { value: 15,  label: `+15 mins (+${currency.format(getExtraPrice(15))})` },
                      { value: 30,  label: `+30 mins (+${currency.format(getExtraPrice(30))})` },
                      { value: 45,  label: `+45 mins (+${currency.format(getExtraPrice(45))})` },
                      { value: 60,  label: `+1 hour (+${currency.format(getExtraPrice(60))})` },
                      { value: 75,  label: `+1h 15m (+${currency.format(getExtraPrice(75))})` },
                      { value: 90,  label: `+1h 30m (+${currency.format(getExtraPrice(90))})` },
                      { value: 105, label: `+1h 45m (+${currency.format(getExtraPrice(105))})` },
                      { value: 120, label: `+2 hours (+${currency.format(getExtraPrice(120))})` },
                      { value: 150, label: `+2h 30m (+${currency.format(getExtraPrice(150))})` },
                      { value: 180, label: `+3 hours (+${currency.format(getExtraPrice(180))})` },
                      { value: 240, label: `+4 hours (+${currency.format(getExtraPrice(240))})` },
                      { value: 300, label: `+5 hours (+${currency.format(getExtraPrice(300))})` },
                      { value: 360, label: `+6 hours (+${currency.format(getExtraPrice(360))})` },
                      { value: 420, label: `+7 hours (+${currency.format(getExtraPrice(420))})` },
                      { value: 480, label: `+8 hours (+${currency.format(getExtraPrice(480))})` },
                      { value: 540, label: `+9 hours (+${currency.format(getExtraPrice(540))})` },
                      { value: 600, label: `+10 hours (+${currency.format(getExtraPrice(600))})` },
                      { value: 660, label: `+11 hours (+${currency.format(getExtraPrice(660))})` },
                      { value: 720, label: `+12 hours (+${currency.format(getExtraPrice(720))})` },
                    ]}
                  />
                  <Field label="Total Amount">
                <input
                      className="input mt-1 font-bold text-green-400"
                  value={currency.format(totalAmount)}
                  readOnly
                />
              </Field>
                </div>
                
                {/* Detailed Pricing Breakdown */}
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <h5 className="text-sm font-semibold text-brand-blue mb-3">Pricing Breakdown</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Base Price (2 hours):</span>
                      <span className="text-white">{currency.format(BASE_PRICE)}</span>
                    </div>
                    {form.additionalMins > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Additional Time ({form.additionalMins} mins):</span>
                        <span className="text-white">{currency.format(getExtraPrice(form.additionalMins))}</span>
                      </div>
                    )}
                    {form.software && form.software.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Software Total:</span>
                        <span className="text-white">{currency.format(form.software.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/10 pt-2">
                      <span className="text-slate-300">Subtotal:</span>
                      <span className="text-white">{currency.format(BASE_PRICE + getExtraPrice(form.additionalMins || 0) + (form.software || []).reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                    </div>
                    {form.pensionYearDiscount && (
                      <div className="flex justify-between text-green-400">
                        <span>Pension Year Discount (10%):</span>
                        <span>-{currency.format((BASE_PRICE + getExtraPrice(form.additionalMins || 0) + (form.software || []).reduce((sum, item) => sum + (item.value || 0), 0)) * 0.1)}</span>
                      </div>
                    )}
                    {form.socialMediaDiscount && (
                      <div className="flex justify-between text-green-400">
                        <span>Social Media Discount (5%):</span>
                        <span>-{currency.format((BASE_PRICE + getExtraPrice(form.additionalMins || 0) + (form.software || []).reduce((sum, item) => sum + (item.value || 0), 0)) * 0.05)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-lg">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">{currency.format(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Software Section */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-lg font-semibold mb-4 text-brand-blue">Software and Licenses</h4>
                
                {/* Add New Software */}
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <h5 className="text-sm font-medium text-white mb-3">Add Software Item</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field
                      label="Software Name"
                      value={form.newSoftwareName || ''}
                      onChange={v => setForm(f => ({ ...f, newSoftwareName: v }))}
                      placeholder="e.g., Microsoft Office"
                    />
                    <Field
                      label="Value ($)"
                      type="number"
                      value={form.newSoftwareValue || ''}
                      onChange={v => setForm(f => ({ ...f, newSoftwareValue: v }))}
                      placeholder="150"
                    />
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          if (form.newSoftwareName && form.newSoftwareValue) {
                            const newItem = {
                              name: form.newSoftwareName,
                              value: parseFloat(form.newSoftwareValue) || 0
                            };
                            setForm(f => ({
                              ...f,
                              software: [...(f.software || []), newItem],
                              newSoftwareName: '',
                              newSoftwareValue: ''
                            }));
                          }
                        }}
                        className="w-full px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-medium"
                      >
                        Add Software
                      </button>
                    </div>
                  </div>
                </div>

                {/* Software List */}
                {form.software && form.software.length > 0 ? (
                  <div className="space-y-2">
                    {form.software.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          <div className="text-xs text-slate-300">License/Software</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-green-400">{currency.format(item.value || 0)}</div>
                          <button
                            onClick={() => {
                              const newSoftware = form.software.filter((_, i) => i !== index);
                              setForm(f => ({ ...f, software: newSoftware }));
                            }}
                            className="px-2 py-1 text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    No software items added yet
                  </div>
                )}
              </div>

              {/* Discounts Section */}
              {/* Discounts Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-brand-sky flex items-center gap-2">
                    <span>🎯</span> Discounts Applied
                  </h4>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.pensionYearDiscount}
                      onChange={e => setForm(f => ({ ...f, pensionYearDiscount: e.target.checked }))}
                      className="w-4 h-4 text-brand-blue"
                    />
                    <span className="text-white">Pension Year Discount (10%)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.socialMediaDiscount}
                      onChange={e => setForm(f => ({ ...f, socialMediaDiscount: e.target.checked }))}
                      className="w-4 h-4 text-brand-blue"
                    />
                    <span className="text-white">Following on Social Media Discount (5%)</span>
                  </label>
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
                    Create - {currency.format(Number(form.amount) || BASE_PRICE)}
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

/* Small UI helpers */
function KPI({ label, value }) {
  return (
    <div className="card p-4">
      <div className="text-slate-300 text-sm">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

/**
 * Field:
 * - If `children` is provided, render it (advanced / custom).
 * - Else render an input. If `onChange` exists → editable. Otherwise → read-only.
 */
function Field({ label, children, value, onChange, placeholder, type = 'text', rows = 3 }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      {children ? (
        <div className="mt-1">{children}</div>
      ) : type === 'textarea' ? (
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
          style={{ backgroundColor: '#0c1450' }}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
          style={{ backgroundColor: '#0c1450' }}
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const normalized = (options || []).map(o =>
    typeof o === 'object' ? o : { value: o, label: o }
  );
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <select
        className="input mt-1"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {normalized.map(o => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
