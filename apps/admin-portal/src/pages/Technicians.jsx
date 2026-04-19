import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { api } from '../lib/api';

export default function Technicians() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank());

  const [q, setQ] = useState('');
  const [active, setActive] = useState('All'); // All | Active | Inactive

  // Account creation modal state
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [accountForm, setAccountForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  function blank() {
    return {
      name: '', email: '', phone: '', skills: '',
      active: true, notes: '',
      address: '',
      emergencyContact: '',
      preferredSuburb: '',          // ✅ unified name
    };
  }

  async function load() {
    setLoading(true); setError('');
    try {
      const data = await api('/techs');
      setTechs(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message || 'Failed'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return techs
      .filter(t => {
        const txt = [
          t.name, t.email, t.phone, t.notes,
          (t.skills || []).join(', '),
          t.address, t.emergencyContact,
          t.preferredSuburb,                 // ✅ included in search
        ].join(' ').toLowerCase();
        const match = !qq || txt.includes(qq);
        const aok = active === 'All' || (active === 'Active' ? t.active : !t.active);
        return match && aok;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [techs, q, active]);

  function openCreate() {
    setEditingId(null);
    setForm(blank());
    setOpen(true);
  }

  function openEdit(t) {
    setEditingId(t._id);
    setForm({
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      skills: (t.skills || []).join(', '),
      active: !!t.active,
      notes: t.notes || '',
      address: t.address || '',
      emergencyContact: t.emergencyContact || '',
      preferredSuburb: t.preferredSuburb || '',    // ✅ unified
    });
    setOpen(true);
  }

  async function save() {
    console.log('Save function called');
    const payload = {
      ...form,
      skills: (form.skills || '').split(',').map(s => s.trim()).filter(Boolean),
      preferredSuburb: (form.preferredSuburb || '').trim(),   // ✅ unified
    };
    try {
      if (editingId) await api(`/techs/${editingId}`, { method: 'PUT', body: payload });
      else await api('/techs', { method: 'POST', body: payload });
      
      // Add a small delay to prevent auto-closing issues
      setTimeout(() => {
        console.log('Closing modal after save');
        setOpen(false);
        setEditingId(null);
        setForm(blank());
      }, 100);
      
      await load();
    } catch (e) { alert(e.message || 'Save failed'); }
  }

  async function remove(id) {
    if (!confirm('Delete this technician?')) return;
    try { await api(`/techs/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { alert(e.message || 'Delete failed'); }
  }

  function openAccountModal(tech) {
    setSelectedTech(tech);
    setAccountForm({ 
      email: tech.email || '', 
      password: '', 
      confirmPassword: '' 
    });
    setAccountError('');
    setAccountSuccess('');
    setAccountModalOpen(true);
  }

  function closeAccountModal() {
    setAccountModalOpen(false);
    setSelectedTech(null);
    setAccountForm({ email: '', password: '', confirmPassword: '' });
    setAccountError('');
    setAccountSuccess('');
  }

  async function createAccount() {
    if (!selectedTech) return;
    
    setAccountError('');
    setAccountSuccess('');

    if (!accountForm.email || !accountForm.password) {
      setAccountError('Email and password are required');
      return;
    }

    if (accountForm.password.length < 6) {
      setAccountError('Password must be at least 6 characters');
      return;
    }

    if (accountForm.password !== accountForm.confirmPassword) {
      setAccountError('Passwords do not match');
      return;
    }

    setAccountLoading(true);
    try {
      await api(`/techs/${selectedTech._id}/create-account`, {
        method: 'POST',
        body: {
          email: accountForm.email,
          password: accountForm.password
        }
      });
      setAccountSuccess(`Login account created for ${selectedTech.name}`);
      await load();
      setTimeout(() => closeAccountModal(), 1500);
    } catch (e) {
      setAccountError(e.message || 'Failed to create account');
    } finally {
      setAccountLoading(false);
    }
  }

  return (
    <div className="page">
      <Header />

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Enhanced Technicians Section */}
        <div className="bg-brand-panel rounded-2xl border border-brand-border overflow-hidden">
          <div className="bg-brand-bg px-6 py-4 border-b border-brand-border">
            <div className="flex flex-wrap items-center gap-4 w-full">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Technicians
                <span className="text-sm font-normal text-text-secondary bg-brand-blue/20 px-3 py-1 rounded-full border border-brand-border">
                  {filtered.length} {filtered.length === 1 ? 'technician' : 'technicians'}
                </span>
              </h2>

              <div className="flex-1 flex gap-3 min-w-[300px]">
                <input
                  className="flex-1 px-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-text-primary placeholder-text-muted focus:border-brand-border-hover focus:ring-2 focus:ring-brand-border/30"
                  placeholder="Search technicians..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />

                <select
                  className="px-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-text-primary focus:border-brand-border-hover focus:ring-2 focus:ring-brand-border/30"
                  value={active}
                  onChange={e => setActive(e.target.value)}
                >
                  {['All', 'Active', 'Inactive'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button 
                className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-text-primary rounded-xl font-medium transition-all duration-200 shadow-soft flex items-center gap-2"
                onClick={openCreate}
              >
                New Technician
              </button>
            </div>
          </div>

          {loading && (
            <div className="p-8 text-center">
              <p className="text-slate-300">Loading technicians...</p>
            </div>
          )}
          
          {error && (
            <div className="p-8 text-center">
              <p className="text-rose-300">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">No Technicians Found</h3>
                  <p className="text-slate-400 mb-4">
                    {q.trim() ? 'No technicians match your search criteria.' : 'Add your first technician to get started!'}
                  </p>
                  {!q.trim() && (
                    <button
                      onClick={openCreate}
                      className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-text-primary rounded-xl font-medium transition-all duration-200 shadow-soft"
                    >
                      Add First Technician
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filtered.map(technician => (
                    <div key={technician._id} className="p-6 hover:bg-white/5 transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        {/* Left Section - Technician Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-brand-blue/20 rounded-xl flex items-center justify-center text-sm font-semibold text-brand-sky uppercase">
                              {(technician.name || 'T').slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-brand-sky transition-colors flex items-center gap-2">
                                {technician.name}
                                {technician.technicianCode && (
                                  <span className="text-xs font-mono bg-brand-blue/30 text-brand-sky px-2 py-1 rounded border border-brand-sky/30">
                                    {technician.technicianCode}
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-text-secondary">
                                <span>
                                  Email: {technician.email || 'No email'}
                                </span>
                                <span>
                                  Phone: {technician.phone || 'No phone'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            {/* Status Badge */}
                            <span className={`px-4 py-2 rounded-full text-sm font-bold border shadow-lg ${
                              technician.active 
                                ? 'bg-gradient-green text-white border-brand-green/50' 
                                : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-500/30'
                            }`}>
                              {technician.active ? 'Active' : 'Inactive'}
                            </span>

                            {/* Preferred Suburb Badge - More Prominent */}
                            {technician.preferredSuburb && (
                              <span className="px-4 py-2 rounded-full text-sm font-bold bg-brand-blue/20 text-brand-sky border border-brand-sky/50 shadow-lg">
                                Preferred Suburb: {technician.preferredSuburb}
                              </span>
                            )}
                          </div>


                          {/* Additional Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brand-sky/80">
                            {technician.address && (
                              <div className="flex items-start gap-3">
                                <span>Address:</span>
                                <span>{technician.address}</span>
                              </div>
                            )}
                            {technician.emergencyContact && (
                              <div className="flex items-start gap-3">
                                <span>Emergency:</span>
                                <span>{technician.emergencyContact}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-3 ml-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(technician)}
                              className="px-4 py-2 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-sky border border-brand-sky/30 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                            >
                              Edit
                            </button>
                            {!technician.hasLoginAccount && (
                              <button
                                onClick={() => openAccountModal(technician)}
                                className="px-4 py-2 bg-green-600/30 hover:bg-green-600/40 text-green-200 border border-green-500/50 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
                              >
                                Create Login
                              </button>
                            )}
                            <button
                              onClick={() => remove(technician._id)}
                              className="px-4 py-2 bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/50 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
                            >
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

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={(e) => { 
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
              <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Technician' : 'New Technician'}</h3>
              <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                Close
              </button>
            </div>

            {/* scrollable content */}
            <div className="px-6 py-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30" style={{ backgroundColor: '#0c1450' }}>

              {/* Personal Details Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-brand-sky">Personal Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Name *" value={form.name}
                         onChange={v => setForm(f => ({ ...f, name: v }))}
                         placeholder="Jordan Smith" />
                  <Field label="Email *" value={form.email}
                         onChange={v => setForm(f => ({ ...f, email: v }))}
                         placeholder="jordan@acme.com" />
                  <Field label="Phone *" value={form.phone}
                         onChange={v => setForm(f => ({ ...f, phone: v }))}
                         placeholder="0400 123 456" />
                  <Field label="Skills (comma-separated)" value={form.skills}
                         onChange={v => setForm(f => ({ ...f, skills: v }))}
                         placeholder="Windows, Networking" />
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="mb-6 rounded-2xl p-6 border border-brand-sky/20" style={{ backgroundColor: '#0c1450' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-brand-sky">Additional Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Address" value={form.address}
                         onChange={v => setForm(f => ({ ...f, address: v }))}
                         placeholder="123 Main Street, Adelaide" />
                  <Field label="Emergency Contact" value={form.emergencyContact}
                         onChange={v => setForm(f => ({ ...f, emergencyContact: v }))}
                         placeholder="Emergency contact details" />
                  <Field
                    label="Preferred Work Suburb"
                    value={form.preferredSuburb}
                    onChange={v => setForm(f => ({ ...f, preferredSuburb: v }))}
                    placeholder="e.g., Modbury"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      id="active"
                      type="checkbox"
                      checked={form.active}
                      onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                      className="w-4 h-4 text-brand-blue"
                    />
                    <label htmlFor="active" className="text-sm text-slate-300">Active Technician</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-300">Notes</label>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
                      style={{ backgroundColor: '#0c1450' }}
                      rows={3}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Certifications, special areas, etc."
                    />
                  </div>
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
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 shadow-lg"
                    onClick={save}
                  >
                    {editingId ? 'Update Technician' : 'Create Technician'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {accountModalOpen && selectedTech && (
        <div
          className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) closeAccountModal(); }}
        >
          <div className="w-full max-w-md card p-4 bg-[#0e1036] border border-white/10 rounded-2xl">
            <h3 className="text-lg font-bold mb-1">
              Create Login Account
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              for {selectedTech.name}
            </p>

            {accountError && (
              <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{accountError}</p>
              </div>
            )}

            {accountSuccess && (
              <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-3 mb-4">
                <p className="text-green-300 text-sm">{accountSuccess}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-300">Email</label>
                <input
                  type="email"
                  className="input mt-1 w-full"
                  value={accountForm.email}
                  onChange={e => setAccountForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="technician@company.com"
                  disabled={accountLoading || accountSuccess}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Password (min 6 characters)</label>
                <input
                  type="password"
                  className="input mt-1 w-full"
                  value={accountForm.password}
                  onChange={e => setAccountForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••"
                  disabled={accountLoading || accountSuccess}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  className="input mt-1 w-full"
                  value={accountForm.confirmPassword}
                  onChange={e => setAccountForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="••••••"
                  disabled={accountLoading || accountSuccess}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button 
                className="btn-blue" 
                onClick={closeAccountModal}
                disabled={accountLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={createAccount}
                disabled={accountLoading || accountSuccess}
              >
                {accountLoading ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <input
        className="w-full px-3 py-2 rounded-lg border border-white/10 mt-1"
        style={{ backgroundColor: '#0c1450' }}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
