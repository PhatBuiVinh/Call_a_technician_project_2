import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthProvider';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS === 'true';

export default function Dashboard() {
  const { user } = useAuth();
  const who = user?.name || user?.email?.split('@')[0] || 'Admin';
  const nav = useNavigate();
  const location = useLocation();

  const BASE_PRICE = 165; // covers up to 2 hours
  const PRICE_PER_15_MIN = 20.625; // $20.625 per 15 minutes
  
  // Calculate extra price for any number of minutes
  const getExtraPrice = (minutes) => {
    return Math.round((minutes / 15) * PRICE_PER_15_MIN * 100) / 100;
  };
  // Add this after EXTRA_PRICE
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

  const JOB_STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Completed', 'Closed'];


  // ----- data state -----
  const [jobs, setJobs] = useState([]);
  const [techs, setTechs] = useState([]); // raw list from API (now has hasLoginAccount)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('All');

  // ----- modal state (New/Edit job) -----
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const empty = {
    title: '',
    invoice: '',
    priority: 'Medium',
    status: 'Open',
    technician: '',
    phone: '',
    description: '',
    // scheduling + customer
    startAt: '',
    endAt: '',
    durationMins: 120, // default 2 hour
    additionalMins: 0,     // extra beyond base
    amount: BASE_PRICE,    // base price by default
    customerName: '',
    customerId: '', // 5-digit id or existing
    // Enhanced customer details
    customerAddress: '',
    customerEmail: '',
    // Software management
    software: [], // Array of {name: string, value: number}
    // Discounts
    pensionYearDiscount: false, // 10% discount
    socialMediaDiscount: false, // 5% discount
    // Troubleshooting (admin/technician only)
    troubleshooting: '',
    // Completion evidence (read-only, populated when viewing completed jobs)
    completionForm: null,
    completionPhotos: [],
    // Job events timeline (read-only in admin modal)
    events: []
  };
  const [form, setForm] = useState(empty);

  // ----- Enhanced form state -----
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [addressSearchTimeout, setAddressSearchTimeout] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [savedSoftware, setSavedSoftware] = useState([]);

  const timelineEvents = useMemo(() => {
    if (!Array.isArray(form.events)) return [];
    return [...form.events].sort((a, b) => {
      const tsA = new Date(a?.timestamp || a?.createdAt || 0).getTime();
      const tsB = new Date(b?.timestamp || b?.createdAt || 0).getTime();
      return tsB - tsA;
    });
  }, [form.events]);

  // Real-time price calculation effect
  useEffect(() => {
    const calculateTotalPrice = () => {
      const softwareTotal = form.software.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
      const additionalTimePrice = getExtraPrice(form.additionalMins || 0);
      const timePrice = BASE_PRICE + additionalTimePrice;
      let total = timePrice + softwareTotal;
      
      if (form.pensionYearDiscount) total *= 0.9;
      if (form.socialMediaDiscount) total *= 0.95;
      
      setForm(prev => ({ ...prev, amount: total }));
    };

    calculateTotalPrice();
  }, [form.additionalMins, form.software, form.pensionYearDiscount, form.socialMediaDiscount]);

  // ----- file input for Import -----
  const [customers, setCustomers] = useState([]);
  useEffect(() => { (async () => {
    try { setCustomers(await api('/customers')); } catch (e) {
      if (!ENABLE_MOCKS) {
        setCustomers([]);
        console.warn('Customer API failed; mock customers disabled.', e);
        return;
      }
      // Add mock customers for testing when API fails
      const mockCustomers = [
        {
          _id: 'customer-1',
          name: 'Test Customer',
          customerId: '10000',
          phone: '123-456-7890',
          email: 'test@example.com',
          address: '123 Test Street, Adelaide, SA 5000'
        },
        {
          _id: 'customer-2',
          name: 'John Smith',
          customerId: '10001',
          phone: '098-765-4321',
          email: 'john@example.com',
          address: '456 Main Road, Adelaide, SA 5001'
        }
      ];
      setCustomers(mockCustomers);
    }
  })(); }, []);

  useEffect(() => {
    load();
    const saved = localStorage.getItem('cat_theme');
    if (saved) document.documentElement.dataset.theme = saved;
    
    // Cleanup timeout on unmount
    return () => {
      if (addressSearchTimeout) {
        clearTimeout(addressSearchTimeout);
      }
    };
  }, []);

  // If we were sent here from Customers with { state: { newJobFor: {...} } }, open New Job prefilled
useEffect(() => {
  const data = location.state?.newJobFor;
  if (data) {
    // Prefill with customer info, default base=120 (2h), extra=0.
    openNew({
      customerId: data.customerId || genCustomerId5(),
      customerName: data.customerName || '',
      phone: data.phone || '',
      durationMins: 120,
      additionalMins: 0,
    });

    // Clear the state so refresh/back won’t reopen the modal
    nav('/app', { replace: true, state: {} });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.state]);

  // If we were sent here from IncomingJobs with { state: { convertRequestId, prefillData } }, open New Job prefilled
  useEffect(() => {
    const convertRequestId = location.state?.convertRequestId;
    const prefillData = location.state?.prefillData;
    
    if (convertRequestId && prefillData) {
      // Open new job modal with all prefill data from the request
      openNew({
        ...prefillData,
        customerId: prefillData.customerId || generateCustomerCode(),
        durationMins: 120,
        additionalMins: 0,
      });

      // Clear the state so refresh/back won’t reopen the modal
      nav('/app', { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const [data, techData] = await Promise.all([
        api('/jobs'),
        api('/techs').catch(() => []),
      ]);
      setJobs(Array.isArray(data) ? data : []);
      setTechs(Array.isArray(techData) ? techData : []);
    } catch (e) {
      setErr(e.message);
      if (!ENABLE_MOCKS) {
        setJobs([]);
        setTechs([]);
        return;
      }
      // Add mock data for testing when API fails
      const mockJob1 = {
        _id: 'test-job-1',
        title: 'Test Job with Full Data',
        description: 'This job has all fields including software and discounts',
        priority: 'High',
        status: 'Open',
        technician: 'John Doe',
        phone: '0412345678',
        invoice: '12345',
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        amount: 492.75, // 165 + 82.5 (1hr) + 350 (software) - 10% pension discount
        durationMins: 120,
        additionalMins: 60, // 1 hour additional
        customerName: 'John Smith',
        customerId: '10001',
        customerAddress: '25 King William Street, Adelaide SA 5000',
        customerEmail: 'john.smith@example.com',
        software: [
          { name: 'Microsoft Office 365', value: 150 },
          { name: 'Adobe Creative Cloud', value: 200 }
        ],
        pensionYearDiscount: true,
        socialMediaDiscount: false,
        troubleshooting: 'Installed software and configured settings',
        createdAt: new Date().toISOString()
      };
      
      const mockJob2 = {
        _id: 'test-job-2',
        title: 'Basic Job',
        description: 'No software or discounts',
        priority: 'Low',
        status: 'In Progress',
        technician: 'Jane Smith',
        phone: '0487654321',
        invoice: '12346',
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        amount: 165,
        durationMins: 120,
        additionalMins: 0,
        customerName: 'Mary Johnson',
        customerId: '10002',
        customerAddress: '100 North Terrace, Adelaide SA 5000',
        customerEmail: 'mary.j@example.com',
        software: [],
        pensionYearDiscount: false,
        socialMediaDiscount: false,
        troubleshooting: '',
        createdAt: new Date().toISOString()
      };
      
      setJobs([mockJob1, mockJob2]);
    } finally {
      setLoading(false);
    }
  }

  // Build a unique list of technician names (deduped, preserve first casing)
  const techOptions = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const t of techs) {
      const name = (t?.name || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(name);
      }
    }
    return out;
  }, [techs]);

  // Lookup: does selected technician have a login account?
  const selectedTechHasAccount = useMemo(() => {
    if (!form.technician) return true; // No tech selected = no issue
    const tech = techs.find(t => t.name?.trim().toLowerCase() === form.technician.trim().toLowerCase());
    return tech ? tech.hasLoginAccount : false; // Unknown tech = unsafe (must be in system to verify account status)
  }, [form.technician, techs]);

  // Is the selected technician known in the system?
  const isKnownTechnician = useMemo(() => {
    if (!form.technician) return true; // No tech selected = no issue
    return techs.some(t => t.name?.trim().toLowerCase() === form.technician.trim().toLowerCase());
  }, [form.technician, techs]);

  // Track if user has confirmed assignment to tech without account
  const [confirmedAssignmentWithoutAccount, setConfirmedAssignmentWithoutAccount] = useState(false);

  // ----- UI actions -----
  async function openNew(prefill = {}) {
    // Refresh jobs data to ensure accurate counts
    await load();
    
    const startIso = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      new Date().getHours(), 0, 0
    ).toISOString();

    const duration = Number(prefill.durationMins ?? 120);
    const extra = Number(prefill.additionalMins ?? 0);
    const endIso = addMinutesISO(startIso, duration + extra);

    // Get sequential invoice number from API (format: INV-2026-0001)
    let newInvoice;
    try {
      const response = await api('/invoices/next-number');
      newInvoice = response.number;
    } catch {
      // Fallback to random if API fails
      const existingInvoices = jobs.map(j => j.invoice).filter(Boolean);
      do {
        newInvoice = String(Math.floor(10000 + Math.random() * 90000));
      } while (existingInvoices.includes(newInvoice));
    }

    setEditingId(null);
    setConfirmedAssignmentWithoutAccount(false); // Reset confirmation for new job
    setForm({
      ...empty,
      startAt: startIso,
      endAt: endIso,
      durationMins: duration,
      additionalMins: extra,
      amount: BASE_PRICE + getExtraPrice(extra),
      customerId: prefill.customerId || generateCustomerCode(),
      customerName: prefill.customerName || '',
      phone: prefill.phone || '',
      customerAddress: prefill.customerAddress || '',
      customerEmail: prefill.customerEmail || '',
      invoice: newInvoice, // Sequential invoice from API
      ...prefill,
    });
    setOpen(true);
  }

  async function openEdit(j) {
  // Refresh jobs data to ensure accurate counts (MUST await to prevent race condition)
  await load();
  
  const add = Number(j.additionalMins || 0);
  const amt = BASE_PRICE + getExtraPrice(add);

  // Try to find customer data from CRM system
  let customerData = {
    customerName: j.customerName || '',
    customerId: j.customerId || '',
    customerAddress: j.customerAddress || '',
    customerEmail: j.customerEmail || '',
  };

  // If customer fields are empty, try to find customer by phone number
  if (!customerData.customerName && j.phone) {
    const existingCustomer = customers.find(c => c.phone === j.phone);
    if (existingCustomer) {
      customerData = {
        customerName: existingCustomer.name,
        customerId: existingCustomer.customerId,
        customerAddress: existingCustomer.address,
        customerEmail: existingCustomer.email,
      };
    }
  }

  setEditingId(j._id);
  setConfirmedAssignmentWithoutAccount(false); // Reset confirmation for edit job

  // Create completely safe formData without any potential circular references
  const formData = {
    title: String(j.title || ''),
    invoice: String(j.invoice || ''),
    priority: String(j.priority || 'Medium'),
    status: String(j.status || 'Open'),
    technician: String(j.technician || ''),
    phone: String(j.phone || ''),
    description: String(j.description || ''),

    // schedule
    startAt: String(j.startAt || ''),
    endAt: String(j.endAt || (j.startAt ? addMinutesISO(j.startAt, 120 + add) : '')),

    // fixed base 2h + existing additional mins
    durationMins: Number(j.durationMins || 120),
    additionalMins: Number(add),

    // pricing - use existing amount if available, otherwise calculate
    amount: Number(j.amount || amt),

    // customer - use loaded customer data
    customerName: String(customerData.customerName || ''),
    customerId: String(customerData.customerId || ''),
    customerAddress: String(customerData.customerAddress || ''),
    customerEmail: String(customerData.customerEmail || ''),

    // software - create completely safe software array
    software: Array.isArray(j.software) ? j.software.map(item => ({
      name: String(item.name || ''),
      value: typeof item.value === 'number' ? item.value : (parseFloat(item.value) || 0)
    })) : [],

    // discounts
    pensionYearDiscount: Boolean(j.pensionYearDiscount),
    socialMediaDiscount: Boolean(j.socialMediaDiscount),

    // troubleshooting
    troubleshooting: String(j.troubleshooting || ''),

    // completion evidence (read-only in admin view)
    completionForm: j.completionForm || null,
    completionPhotos: j.completionPhotos || [],

    // timeline events (read-only in admin view)
    events: Array.isArray(j.events) ? j.events : []
  };

  // Form data created safely without circular references
  
  setForm(formData);
  setOpen(true);
  
  console.log('=== MODAL OPENED ===');
}


async function save() {
  try {
    // 1) Validate required fields
    if (!form.customerName.trim()) {
      alert('Customer name is required');
      return;
    }
    if (!form.phone.trim()) {
      alert('Phone number is required');
      return;
    }
    // Assignment safety: block if tech list failed to load
    if (form.technician && techs.length === 0) {
      alert(
        `Cannot verify technician safety.\n\n` +
        `Technician list failed to load. Please refresh the page and try again.`
      );
      return;
    }

    // Assignment safety: block if unknown technician (not in system)
    if (form.technician && techs.length > 0 && !isKnownTechnician && !confirmedAssignmentWithoutAccount) {
      alert(
        `Cannot assign job to "${form.technician}".\n\n` +
        `This technician is not in the system.\n\n` +
        `Please either:\n` +
        `1. Create this technician in the Technicians page first, or\n` +
        `2. Select an existing technician from the dropdown, or\n` +
        `3. Click "I understand, assign anyway" to confirm.`
      );
      return;
    }

    // Assignment safety: block if tech has no login account and not confirmed
    if (form.technician && isKnownTechnician && !selectedTechHasAccount && !confirmedAssignmentWithoutAccount) {
      alert(
        `Cannot assign job to "${form.technician}".\n\n` +
        `This technician does not have a login account and cannot access /tech-view.\n\n` +
        `Please either:\n` +
        `1. Create a login account for this technician first (go to Technicians page → Create Login), or\n` +
        `2. Click "I understand, assign anyway" to confirm.`
      );
      return;
    }
    if (!form.customerAddress.trim()) {
      alert('Customer address is required');
      return;
    }
    if (!form.title.trim()) {
      alert('Job title is required');
      return;
    }
    if (!form.description.trim()) {
      alert('Job description is required');
      return;
    }
    if (!form.invoice.trim()) {
      alert('Invoice number is required');
      return;
    }

    // 2) Normalize duration + extra and recompute derived fields
    const base = Number(form.durationMins || 0);
    const extra = Number(form.additionalMins || 0);

    const endAt = form.startAt
      ? addMinutesISO(form.startAt, base + extra)
      : form.endAt;

    // Calculate total with software and discounts
    const softwareTotal = form.software.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
    const timePrice = BASE_PRICE + getExtraPrice(extra);
    let total = timePrice + softwareTotal;
    if (form.pensionYearDiscount) total *= 0.9;
    if (form.socialMediaDiscount) total *= 0.95;

    // Create safe body object without circular references
    const body = {
      title: String(form.title || ''),
      invoice: String(form.invoice || ''),
      priority: String(form.priority || 'Medium'),
      status: String(form.status || 'Open'),
      technician: String(form.technician || ''),
      phone: String(form.phone || ''),
      description: String(form.description || ''),
      startAt: String(form.startAt || ''),
      endAt: String(endAt),
      durationMins: Number(base),
      additionalMins: Number(extra),
      amount: Number(total),
      customerName: String(form.customerName || ''),
      customerId: String(form.customerId || ''),
      customerAddress: String(form.customerAddress || ''),
      customerEmail: String(form.customerEmail || ''),
      software: Array.isArray(form.software) ? form.software.map(item => ({
        name: String(item.name || ''),
        value: typeof item.value === 'number' ? item.value : (parseFloat(item.value) || 0)
      })) : [],
      pensionYearDiscount: Boolean(form.pensionYearDiscount),
      socialMediaDiscount: Boolean(form.socialMediaDiscount),
      troubleshooting: String(form.troubleshooting || ''),
      ...(form._sourceRequestId && { sourceRequestId: form._sourceRequestId })
    };

    // 3) Create/Update customer in CRM (always ensure customer exists)
    let customerId = form.customerId;
    try {
      const existingCustomer = customers.find(c => 
        c.customerId === form.customerId || 
        (c.name?.toLowerCase() === form.customerName.toLowerCase() && c.phone === form.phone)
      );
      
      if (!existingCustomer) {
        // Create new customer in CRM
        const customerData = {
          customerId: form.customerId,
          name: form.customerName.trim(),
          phone: form.phone.trim(),
          email: form.customerEmail.trim() || '',
          address: form.customerAddress.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const savedCustomer = await api('/customers', { method: 'POST', body: customerData });
        customerId = savedCustomer.customerId;
        setCustomers(prev => [savedCustomer, ...prev]);
        // New customer saved to CRM
      } else {
        // Update existing customer if details changed
        const hasChanges = 
          existingCustomer.name !== form.customerName.trim() ||
          existingCustomer.phone !== form.phone.trim() ||
          existingCustomer.email !== (form.customerEmail.trim() || '') ||
          existingCustomer.address !== form.customerAddress.trim();
        
        if (hasChanges) {
          const updatedCustomerData = {
            name: form.customerName.trim(),
            phone: form.phone.trim(),
            email: form.customerEmail.trim() || '',
            address: form.customerAddress.trim(),
            updatedAt: new Date().toISOString()
          };
          
          const updatedCustomer = await api(`/customers/${existingCustomer._id}`, { 
            method: 'PUT', 
            body: updatedCustomerData 
          });
          setCustomers(prev => prev.map(c => c._id === existingCustomer._id ? updatedCustomer : c));
          // Customer details updated in CRM
        }
        customerId = existingCustomer.customerId;
      }
    } catch (e) {
      console.error('❌ Customer CRM operation failed:', e);
      // Continue with job creation even if customer save fails
    }

    // 4) Create/Update the job
    let saved;
    if (editingId) {
      saved = await api(`/jobs/${editingId}`, { method: 'PUT', body });
      setJobs(prev => prev.map(j => (j._id === saved._id ? saved : j)));
    } else {
      saved = await api('/jobs', { method: 'POST', body });
      setJobs(prev => [saved, ...prev]);
    }

    // 5) Auto-create or sync invoice
    try {
      if (body.invoice) {
        // Check if invoice already exists
        const existingInvoices = await api('/invoices').catch(() => []);
        const existingInvoice = existingInvoices.find(inv => inv.number === body.invoice);
        
        if (existingInvoice) {
          // Update existing invoice
          const invoiceUpdateData = {
            number: body.invoice,
            customer: form.customerName, // Main customer field for backward compatibility
            customerId: customerId,
            customerName: form.customerName,
            customerPhone: form.phone,
            customerEmail: form.customerEmail || '',
            customerAddress: form.customerAddress,
            jobTitle: form.title,
            jobDescription: form.description,
            fixedPrice: BASE_PRICE,
            additionalMins: extra,
            software: form.software.map(item => ({
              name: item.name || '',
              value: typeof item.value === 'number' ? item.value : (parseFloat(item.value) || 0)
            })),
            pensionYearDiscount: form.pensionYearDiscount,
            socialMediaDiscount: form.socialMediaDiscount,
            amount: total,
            status: 'Pending',
            date: new Date().toISOString(),
            notes: form.troubleshooting || form.description || '',
            createdAt: existingInvoice.createdAt,
            updatedAt: new Date().toISOString()
          };
          
          await api(`/invoices/${existingInvoice._id}`, {
            method: 'PUT',
            body: invoiceUpdateData
          });
          // Invoice updated
        } else {
          // Create new invoice
          const invoiceData = {
            number: body.invoice,
            customer: form.customerName, // Main customer field for backward compatibility
            customerId: customerId,
            customerName: form.customerName,
            customerPhone: form.phone,
            customerEmail: form.customerEmail || '',
            customerAddress: form.customerAddress,
            jobTitle: form.title,
            jobDescription: form.description,
              fixedPrice: BASE_PRICE,
              additionalMins: extra,
            software: form.software.map(item => ({
              name: item.name || '',
              value: typeof item.value === 'number' ? item.value : (parseFloat(item.value) || 0)
            })),
            pensionYearDiscount: form.pensionYearDiscount,
            socialMediaDiscount: form.socialMediaDiscount,
            amount: total,
            status: 'Pending',
            date: new Date().toISOString(),
            notes: form.troubleshooting || form.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await api('/invoices', {
            method: 'POST',
            body: invoiceData
          });
          // New invoice created
        }
      }
    } catch (e) {
      console.error('❌ Invoice operation failed:', e);
      // Continue with job creation even if invoice fails
    }

    // 6) Close modal and reset form only on successful save
    // Job saved successfully
    
    // Refresh jobs list to show updated data
    await load();
    
    // Add a small delay to prevent accidental closing
    setTimeout(() => {
      setOpen(false);
      setForm(empty);
      setShowCustomerSuggestions(false);
      setShowAddressSuggestions(false);
    }, 100);
  } catch (e) {
    console.error('Save failed:', e);
    // Check for duplicate conversion error
    const errorMsg = e.message || '';
    if (errorMsg.toLowerCase().includes('already converted') || errorMsg.toLowerCase().includes('already converted to a job')) {
      alert('This request has already been converted to a job. The status will refresh.');
      // Refresh data without full page reload
      await load();
      setOpen(false);
      setForm(empty);
    } else {
      alert(e.message || 'Save failed');
    }
    // Don't close modal on error - let user fix the issue or navigate away
  }
}



  async function removeJob(id) {
    if (!confirm('Delete this job?')) return;
    try {
      await api(`/jobs/${id}`, { method: 'DELETE' });
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function downloadCompletionReport() {
    if (!editingId) return;
    if (!form.completionForm?.submittedAt) {
      alert('No completion submission found for this job yet.');
      return;
    }

    const submittedAt = new Date(form.completionForm.submittedAt).toLocaleString();
    const technicianName = form.technician || 'Unknown technician';
    const photos = Array.isArray(form.completionPhotos) ? form.completionPhotos : [];

    const photoHtml = photos.length > 0
      ? photos.map((photo, idx) => {
          const safeUrl = escapeHtml(photo?.url || '');
          return `
            <div class="photo-item">
              <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">
                <img src="${safeUrl}" alt="Evidence Photo ${idx + 1}" />
              </a>
              <div class="photo-caption">Photo ${idx + 1} - <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open original</a></div>
            </div>
          `;
        }).join('')
      : '<p class="muted">No evidence photos submitted.</p>';

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Job Completion Report - ${escapeHtml(form.invoice || '')}</title>
    <style>
      body {
        font-family: "Segoe UI", Tahoma, sans-serif;
        color: #0f172a;
        margin: 24px;
        line-height: 1.45;
      }
      h1 { margin: 0 0 8px 0; font-size: 26px; }
      h2 { margin: 24px 0 8px 0; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
      .muted { color: #64748b; }
      .meta-grid {
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 6px 14px;
        margin-top: 12px;
      }
      .meta-key { color: #334155; font-weight: 600; }
      .box {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        white-space: pre-wrap;
        background: #f8fafc;
      }
      .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
        gap: 12px;
      }
      .photo-item {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px;
      }
      .photo-item img {
        width: 100%;
        height: 130px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
      }
      .photo-caption { margin-top: 6px; font-size: 12px; color: #475569; }
      @media print {
        body { margin: 14mm; }
        a { color: #0f172a; text-decoration: none; }
      }
    </style>
  </head>
  <body>
    <h1>Job Completion Report</h1>
    <div class="muted">Generated ${escapeHtml(new Date().toLocaleString())}</div>

    <h2>Job Details</h2>
    <div class="meta-grid">
      <div class="meta-key">Job Title</div><div>${escapeHtml(form.title || '')}</div>
      <div class="meta-key">Customer</div><div>${escapeHtml(form.customerName || '')}</div>
      <div class="meta-key">Invoice</div><div>${escapeHtml(form.invoice || '')}</div>
      <div class="meta-key">Technician</div><div>${escapeHtml(technicianName)}</div>
      <div class="meta-key">Submitted At</div><div>${escapeHtml(submittedAt)}</div>
    </div>

    <h2>Completion Form</h2>
    <div class="meta-grid" style="margin-bottom:8px;">
      <div class="meta-key">Follow-up Required</div><div>${form.completionForm?.followUpRequired ? 'Yes' : 'No'}</div>
    </div>
    <div class="meta-key" style="margin-bottom:4px;">Work Performed</div>
    <div class="box">${escapeHtml(form.completionForm?.workPerformed || 'N/A')}</div>

    <div class="meta-key" style="margin-top:12px; margin-bottom:4px;">Parts Used</div>
    <div class="box">${escapeHtml(form.completionForm?.partsUsed || 'N/A')}</div>

    <div class="meta-key" style="margin-top:12px; margin-bottom:4px;">Follow-up Notes</div>
    <div class="box">${escapeHtml(form.completionForm?.followUpNotes || 'N/A')}</div>

    <h2>Attachments</h2>
    <div class="photo-grid">${photoHtml}</div>

    <script>
      window.onload = function () {
        window.print();
      };
    </script>
  </body>
</html>`;

    // Create a Blob and trigger file download instead of using popups
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const filename = `Job-Completion-Report-${form.invoice || 'unknown'}.html`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Failed to download report:', e);
      alert('Failed to download report. Please try again.');
    }
  }

  // helpers
  function toLocal(iso) {
    if (!iso) return '';
    const dt = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
      dt.getHours()
    )}:${pad(dt.getMinutes())}`;
  }
  function fromLocal(local) {
    return new Date(local).toISOString();
  }
  function addMinutesISO(iso, minutes) {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString();
  }
  function genCustomerId5() {
    return String(Math.floor(10000 + Math.random() * 90000));
  }
  function formatRelativeTime(isoLike) {
    if (!isoLike) return 'Unknown time';
    const ts = new Date(isoLike).getTime();
    if (Number.isNaN(ts)) return 'Unknown time';

    const diffMs = Date.now() - ts;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }

  function getEventMeta(type) {
    const map = {
      job_created: {
        label: 'Job Created',
        badgeClass: 'badge-emerald',
        dotClass: 'bg-green-400/30 border-green-400'
      },
      status_changed: {
        label: 'Status Changed',
        badgeClass: 'badge-sky',
        dotClass: 'bg-sky-400/30 border-sky-400'
      },
      technician_assigned: {
        label: 'Technician Assigned',
        badgeClass: 'badge-blue',
        dotClass: 'bg-cyan-400/30 border-cyan-400'
      },
      note_added: {
        label: 'Note Added',
        badgeClass: 'badge-amber',
        dotClass: 'bg-amber-400/30 border-amber-400'
      },
      completion_submitted: {
        label: 'Completion Submitted',
        badgeClass: 'badge-emerald',
        dotClass: 'bg-emerald-400/30 border-emerald-400'
      },
      job_closed: {
        label: 'Job Closed',
        badgeClass: 'badge-slate',
        dotClass: 'bg-rose-400/30 border-rose-400'
      }
    };
    return map[type] || {
      label: 'Event',
      badgeClass: 'badge-slate',
      dotClass: 'bg-slate-400/30 border-slate-400'
    };
  }

  function renderEventDetails(event) {
    const details = event?.details || {};
    switch (event?.type) {
      case 'status_changed':
        return `Status changed: ${details.fromStatus || 'Unknown'} -> ${details.toStatus || 'Unknown'}`;
      case 'technician_assigned':
        return `Assigned technician: ${details.techName || 'Unknown technician'}`;
      case 'note_added': {
        const author = details.author || event?.actorName || 'Unknown';
        const preview = details.notePreview ? ` "${details.notePreview}"` : '';
        return `Note added by ${author}.${preview}`;
      }
      case 'completion_submitted':
        return `Completion evidence submitted by ${details.techName || event?.actorName || 'Technician'}`;
      case 'job_closed':
        return 'Job was moved to Closed status';
      case 'job_created':
        return 'Job record was created';
      default:
        return 'Job activity recorded';
    }
  }

  // Generate customer ID starting from 10000
  function generateCustomerCode() {
    const existingIds = new Set((customers || []).map(c => String(c.customerId)));
    let code = 10000;
    while (existingIds.has(String(code))) {
      code++;
    }
    return String(code);
  }

  // Comprehensive South Australia Address Database
  const SA_ADDRESS_DATABASE = {
    // Major Adelaide Streets and Landmarks
    majorStreets: [
      'Rundle Mall', 'King William Street', 'North Terrace', 'Grenfell Street', 'Flinders Street',
      'Victoria Square', 'Hindley Street', 'East Terrace', 'West Terrace', 'South Terrace',
      'Gouger Street', 'Currie Street', 'Wakefield Street', 'Pulteney Street', 'Hutt Street',
      'O\'Connell Street', 'Rundle Street', 'Melbourne Street', 'The Parade', 'Henley Beach Road',
      'Port Road', 'Main North Road', 'Grand Junction Road', 'South Road', 'Goodwood Road',
      'Anzac Highway', 'Marion Road', 'Cross Road', 'Belair Road', 'Greenhill Road',
      'Magill Road', 'Payneham Road', 'Lower North East Road', 'Nelson Road', 'Sturt Road',
      'Frome Road', 'Barton Terrace', 'Fullarton Road', 'Unley Road', 'Glen Osmond Road',
      'Torrens Road', 'Prospect Road', 'Portrush Road', 'Hackney Road', 'Norwood Parade',
      'The Parade', 'Kensington Road', 'Rose Terrace', 'Carrington Street', 'Waymouth Street',
      'Franklin Street', 'Light Square', 'Hindmarsh Square', 'Whitmore Square', 'Wellington Square'
    ],
    
    // Adelaide CBD Streets
    cbdStreets: [
      'King William Street', 'North Terrace', 'Grenfell Street', 'Flinders Street',
      'Hindley Street', 'Gouger Street', 'Currie Street', 'Wakefield Street',
      'Pulteney Street', 'Hutt Street', 'O\'Connell Street', 'Rundle Street',
      'Frome Road', 'Barton Terrace', 'Carrington Street', 'Waymouth Street',
      'Franklin Street', 'Light Square', 'Hindmarsh Square', 'Whitmore Square'
    ],
    
    // Comprehensive South Australia Suburbs with Postcodes
    suburbs: [
      // Adelaide Metropolitan
      { name: 'Adelaide', postcode: '5000' },
      { name: 'North Adelaide', postcode: '5006' },
      { name: 'Glenelg', postcode: '5045' },
      { name: 'Burnside', postcode: '5066' },
      { name: 'Unley', postcode: '5061' },
      { name: 'Prospect', postcode: '5082' },
      { name: 'Salisbury', postcode: '5108' },
      { name: 'Tea Tree Gully', postcode: '5091' },
      { name: 'Holdfast Bay', postcode: '5043' },
      { name: 'Marion', postcode: '5043' },
      { name: 'Mitcham', postcode: '5062' },
      { name: 'Norwood Payneham St Peters', postcode: '5067' },
      { name: 'Port Adelaide Enfield', postcode: '5015' },
      { name: 'Charles Sturt', postcode: '5034' },
      { name: 'Campbelltown', postcode: '5074' },
      { name: 'Gawler', postcode: '5118' },
      { name: 'Onkaparinga', postcode: '5162' },
      { name: 'Playford', postcode: '5112' },
      { name: 'Walkerville', postcode: '5081' },
      { name: 'West Torrens', postcode: '5034' },
      
      // Adelaide Hills
      { name: 'Mount Barker', postcode: '5251' },
      { name: 'Stirling', postcode: '5152' },
      { name: 'Hahndorf', postcode: '5245' },
      { name: 'Aldgate', postcode: '5154' },
      { name: 'Bridgewater', postcode: '5155' },
      { name: 'Crafers', postcode: '5152' },
      { name: 'Echunga', postcode: '5153' },
      { name: 'Mylor', postcode: '5157' },
      { name: 'Nairne', postcode: '5252' },
      { name: 'Oakbank', postcode: '5243' },
      
      // Fleurieu Peninsula
      { name: 'Victor Harbor', postcode: '5211' },
      { name: 'Goolwa', postcode: '5214' },
      { name: 'Port Elliot', postcode: '5212' },
      { name: 'Middleton', postcode: '5213' },
      { name: 'Yankalilla', postcode: '5203' },
      { name: 'Normanville', postcode: '5204' },
      { name: 'Rapid Bay', postcode: '5204' },
      { name: 'Second Valley', postcode: '5204' },
      { name: 'Cape Jervis', postcode: '5204' },
      { name: 'Carraringa', postcode: '5204' },
      
      // Yorke Peninsula
      { name: 'Kadina', postcode: '5554' },
      { name: 'Wallaroo', postcode: '5556' },
      { name: 'Moonta', postcode: '5558' },
      { name: 'Port Wakefield', postcode: '5550' },
      { name: 'Maitland', postcode: '5573' },
      { name: 'Minlaton', postcode: '5575' },
      { name: 'Warooka', postcode: '5577' },
      { name: 'Yorketown', postcode: '5576' },
      { name: 'Edithburgh', postcode: '5583' },
      { name: 'Marion Bay', postcode: '5583' },
      
      // Eyre Peninsula
      { name: 'Port Augusta', postcode: '5700' },
      { name: 'Whyalla', postcode: '5600' },
      { name: 'Ceduna', postcode: '5690' },
      { name: 'Port Lincoln', postcode: '5606' },
      { name: 'Tumby Bay', postcode: '5605' },
      { name: 'Cleve', postcode: '5640' },
      { name: 'Kimba', postcode: '5641' },
      { name: 'Wudinna', postcode: '5652' },
      { name: 'Streaky Bay', postcode: '5680' },
      { name: 'Elliston', postcode: '5670' },
      
      // Murray Mallee
      { name: 'Murray Bridge', postcode: '5253' },
      { name: 'Mannum', postcode: '5238' },
      { name: 'Tailem Bend', postcode: '5260' },
      { name: 'Meningie', postcode: '5264' },
      { name: 'Coonalpyn', postcode: '5265' },
      { name: 'Tintinara', postcode: '5268' },
      { name: 'Bordertown', postcode: '5268' },
      { name: 'Keith', postcode: '5267' },
      { name: 'Naracoorte', postcode: '5271' },
      { name: 'Millicent', postcode: '5280' },
      
      // Limestone Coast
      { name: 'Mount Gambier', postcode: '5290' },
      { name: 'Port Macdonnell', postcode: '5291' },
      { name: 'Penola', postcode: '5277' },
      { name: 'Coonawarra', postcode: '5263' },
      { name: 'Kingston', postcode: '5275' },
      { name: 'Lucindale', postcode: '5272' },
      { name: 'Robe', postcode: '5276' },
      { name: 'Beachport', postcode: '5280' },
      { name: 'Portland', postcode: '5277' },
      { name: 'Carpenter Rocks', postcode: '5291' },
      
      // Flinders Ranges
      { name: 'Quorn', postcode: '5433' },
      { name: 'Hawker', postcode: '5434' },
      { name: 'Leigh Creek', postcode: '5731' },
      { name: 'Copley', postcode: '5732' },
      { name: 'Parachilna', postcode: '5730' },
      { name: 'Blinman', postcode: '5730' },
      { name: 'Wilpena Pound', postcode: '5730' },
      { name: 'Paralana', postcode: '5730' },
      { name: 'Angorichina', postcode: '5730' },
      { name: 'Beltana', postcode: '5730' },
      
      // Riverland
      { name: 'Berri', postcode: '5343' },
      { name: 'Renmark', postcode: '5341' },
      { name: 'Loxton', postcode: '5333' },
      { name: 'Waikerie', postcode: '5330' },
      { name: 'Barmera', postcode: '5345' },
      { name: 'Monash', postcode: '5342' },
      { name: 'Paringa', postcode: '5340' },
      { name: 'Lyrup', postcode: '5343' },
      { name: 'Glossop', postcode: '5343' },
      { name: 'Winkie', postcode: '5343' }
    ],
    
    // Street Types in South Australia
    streetTypes: [
      'Street', 'Road', 'Avenue', 'Drive', 'Place', 'Court', 'Crescent', 'Lane', 'Way', 'Terrace',
      'Close', 'Grove', 'Rise', 'Circuit', 'Parade', 'Boulevard', 'Esplanade', 'Walk', 'Trail',
      'Highway', 'Freeway', 'Track', 'Path', 'Access', 'Link', 'Bridge', 'Causeway', 'Underpass'
    ],
    
    // Common Street Names in South Australia
    commonStreets: [
      'Main', 'High', 'Church', 'School', 'Station', 'Railway', 'Airport', 'Hospital', 'Park',
      'Victoria', 'Albert', 'George', 'William', 'Charles', 'Edward', 'James', 'John', 'Thomas',
      'Elizabeth', 'Mary', 'Ann', 'Jane', 'Sarah', 'Rose', 'Ivy', 'Lily', 'Daisy', 'Poppy',
      'Oak', 'Pine', 'Cedar', 'Elm', 'Maple', 'Birch', 'Ash', 'Beech', 'Willow', 'Gum',
      'Sunset', 'Sunrise', 'Ocean', 'Beach', 'Hill', 'Valley', 'Ridge', 'Peak', 'Spring', 'Creek',
      'Queen', 'King', 'Princess', 'Prince', 'Duke', 'Earl', 'Count', 'Lord', 'Lady', 'Sir',
      'Warren', 'Grove', 'Heights', 'Manor', 'Villa', 'Court', 'Gardens', 'Plaza', 'Square',
      'Terrace', 'Place', 'Close', 'Lane', 'Drive', 'Way', 'Crescent', 'Boulevard', 'Esplanade'
    ],
    
    // Unit/Apartment Numbers
    unitNumbers: [
      'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10',
      'Unit 11', 'Unit 12', 'Unit 13', 'Unit 14', 'Unit 15', 'Unit 16', 'Unit 17', 'Unit 18', 'Unit 19', 'Unit 20',
      'Unit A', 'Unit B', 'Unit C', 'Unit D', 'Unit E', 'Unit F', 'Unit G', 'Unit H',
      'Apt 1', 'Apt 2', 'Apt 3', 'Apt 4', 'Apt 5', 'Apt 6', 'Apt 7', 'Apt 8', 'Apt 9', 'Apt 10',
      'Suite 1', 'Suite 2', 'Suite 3', 'Suite 4', 'Suite 5', 'Suite 6', 'Suite 7', 'Suite 8',
      'Shop 1', 'Shop 2', 'Shop 3', 'Shop 4', 'Shop 5', 'Shop 6', 'Shop 7', 'Shop 8',
      'Office 1', 'Office 2', 'Office 3', 'Office 4', 'Office 5', 'Office 6', 'Office 7', 'Office 8'
    ],
    
    // Building Types
    buildingTypes: [
      'Apartments', 'Units', 'Townhouses', 'Villas', 'Offices', 'Shops', 'Warehouses', 'Factories',
      'Medical Centre', 'Shopping Centre', 'Office Building', 'Residential Complex', 'Business Park',
      'Industrial Estate', 'Commercial Building', 'Retail Centre', 'Medical Building', 'Educational Building'
    ],
    
    // House Numbers
    houseNumbers: [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
      '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
      '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60',
      '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80',
      '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100',
      '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120',
      '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140',
      '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160',
      '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180',
      '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199', '200'
    ]
  };

  // Comprehensive South Australia Address Suggestions
  async function getAddressSuggestions(query) {
    if (!query || query.length < 2) {
      setAddressSuggestions([]);
      setIsLoadingAddresses(false);
      return;
    }
    
    setIsLoadingAddresses(true);
    
    try {
      const suggestions = [];
      const queryLower = query.toLowerCase();
      
      // 1. Search major streets and landmarks across all of South Australia
      SA_ADDRESS_DATABASE.majorStreets.forEach(street => {
        if (street.toLowerCase().includes(queryLower)) {
          // Add multiple variations for major streets
          suggestions.push(`${street}, Adelaide SA 5000, Australia`);
          if (street !== 'Rundle Mall' && street !== 'Victoria Square') {
            // Add numbered addresses for streets with units
            SA_ADDRESS_DATABASE.houseNumbers.slice(0, 5).forEach(num => {
              suggestions.push(`${num} ${street}, Adelaide SA 5000, Australia`);
              // Add unit variations
              SA_ADDRESS_DATABASE.unitNumbers.slice(0, 3).forEach(unit => {
                suggestions.push(`${unit}, ${num} ${street}, Adelaide SA 5000, Australia`);
              });
            });
          }
        }
      });
      
      // 2. Search CBD streets with detailed addresses
      SA_ADDRESS_DATABASE.cbdStreets.forEach(street => {
        if (street.toLowerCase().includes(queryLower)) {
          // Add building variations
          SA_ADDRESS_DATABASE.buildingTypes.slice(0, 3).forEach(building => {
            suggestions.push(`${building}, ${street}, Adelaide SA 5000, Australia`);
          });
          // Add numbered addresses
          SA_ADDRESS_DATABASE.houseNumbers.slice(0, 10).forEach(num => {
            suggestions.push(`${num} ${street}, Adelaide SA 5000, Australia`);
          });
        }
      });
      
      // 3. Search by suburb names across ALL of South Australia
      SA_ADDRESS_DATABASE.suburbs.forEach(suburb => {
        if (suburb.name.toLowerCase().includes(queryLower)) {
          // Add common street patterns for this suburb
          SA_ADDRESS_DATABASE.streetTypes.slice(0, 4).forEach(streetType => {
            const streetName = query.length > 3 ? query : 'Main';
            // Add house numbers with units
            SA_ADDRESS_DATABASE.houseNumbers.slice(0, 5).forEach(num => {
              suggestions.push(`${num} ${streetName} ${streetType}, ${suburb.name} SA ${suburb.postcode}, Australia`);
              // Add unit variations
              SA_ADDRESS_DATABASE.unitNumbers.slice(0, 2).forEach(unit => {
                suggestions.push(`${unit}, ${num} ${streetName} ${streetType}, ${suburb.name} SA ${suburb.postcode}, Australia`);
              });
            });
          });
        }
      });
      
      // 4. Search by street names in all South Australia suburbs
      if (queryLower.length >= 3) {
        SA_ADDRESS_DATABASE.suburbs.slice(0, 15).forEach(suburb => { // Limit to prevent too many results
          SA_ADDRESS_DATABASE.streetTypes.forEach(streetType => {
            if (`${query} ${streetType}`.toLowerCase().includes(queryLower)) {
              // Add multiple house numbers
              SA_ADDRESS_DATABASE.houseNumbers.slice(0, 3).forEach(num => {
                suggestions.push(`${num} ${query} ${streetType}, ${suburb.name} SA ${suburb.postcode}, Australia`);
                // Add unit variations
                SA_ADDRESS_DATABASE.unitNumbers.slice(0, 2).forEach(unit => {
                  suggestions.push(`${unit}, ${num} ${query} ${streetType}, ${suburb.name} SA ${suburb.postcode}, Australia`);
                });
              });
            }
          });
        });
      }
      
      // 5. Search by common street names
      SA_ADDRESS_DATABASE.commonStreets.forEach(streetName => {
        if (streetName.toLowerCase().includes(queryLower)) {
          // Add to multiple suburbs
          SA_ADDRESS_DATABASE.suburbs.slice(0, 10).forEach(suburb => {
            SA_ADDRESS_DATABASE.streetTypes.slice(0, 3).forEach(streetType => {
              // Add house numbers with units
              SA_ADDRESS_DATABASE.houseNumbers.slice(0, 3).forEach(num => {
                suggestions.push(`${num} ${streetName} ${streetType}, ${suburb.name} SA ${suburb.postcode}, Australia`);
                // Add unit variations
                SA_ADDRESS_DATABASE.unitNumbers.slice(0, 2).forEach(unit => {
                  suggestions.push(`${unit}, ${num} ${streetName} ${streetType}, ${suburb.name} SA ${suburb.postcode}, Australia`);
                });
              });
            });
          });
        }
      });
      
      // 6. Add specific well-known South Australia addresses with units
      const wellKnownAddresses = [
        // Adelaide CBD - Major Buildings
        '1 King William Street, Adelaide SA 5000, Australia', // Parliament House
        'Unit 1, 1 King William Street, Adelaide SA 5000, Australia',
        '50 Rundle Mall, Adelaide SA 5000, Australia', // Myer Centre
        'Shop 1, 50 Rundle Mall, Adelaide SA 5000, Australia',
        '100 North Terrace, Adelaide SA 5000, Australia', // University of Adelaide
        'Office 1, 100 North Terrace, Adelaide SA 5000, Australia',
        '200 Victoria Square, Adelaide SA 5000, Australia', // Victoria Square
        'Unit 2, 200 Victoria Square, Adelaide SA 5000, Australia',
        
        // Regional SA - Major Towns with Units
        '1 Commercial Street, Mount Gambier SA 5290, Australia', // Mount Gambier
        'Unit 1, 1 Commercial Street, Mount Gambier SA 5290, Australia',
        '1 Railway Terrace, Port Augusta SA 5700, Australia', // Port Augusta
        'Suite 1, 1 Railway Terrace, Port Augusta SA 5700, Australia',
        '1 Main Street, Whyalla SA 5600, Australia', // Whyalla
        'Unit A, 1 Main Street, Whyalla SA 5600, Australia',
        '1 High Street, Port Lincoln SA 5606, Australia', // Port Lincoln
        'Office 1, 1 High Street, Port Lincoln SA 5606, Australia',
        '1 Railway Terrace, Murray Bridge SA 5253, Australia', // Murray Bridge
        'Unit 1, 1 Railway Terrace, Murray Bridge SA 5253, Australia',
        '1 Commercial Street, Victor Harbor SA 5211, Australia', // Victor Harbor
        'Shop 1, 1 Commercial Street, Victor Harbor SA 5211, Australia',
        '1 Main Street, Kadina SA 5554, Australia', // Kadina
        'Unit 1, 1 Main Street, Kadina SA 5554, Australia',
        '1 Commercial Street, Berri SA 5343, Australia', // Berri
        'Suite 1, 1 Commercial Street, Berri SA 5343, Australia',
        '1 Railway Terrace, Quorn SA 5433, Australia', // Quorn
        'Unit A, 1 Railway Terrace, Quorn SA 5433, Australia',
        
        // Adelaide Hills with Units
        '1 Mount Barker Road, Mount Barker SA 5251, Australia',
        'Unit 1, 1 Mount Barker Road, Mount Barker SA 5251, Australia',
        '1 Main Street, Hahndorf SA 5245, Australia',
        'Shop 1, 1 Main Street, Hahndorf SA 5245, Australia',
        '1 Stirling Road, Stirling SA 5152, Australia',
        'Unit 2, 1 Stirling Road, Stirling SA 5152, Australia',
        
        // Fleurieu Peninsula with Units
        '1 Ocean Street, Goolwa SA 5214, Australia',
        'Unit 1, 1 Ocean Street, Goolwa SA 5214, Australia',
        '1 Esplanade, Port Elliot SA 5212, Australia',
        'Suite 1, 1 Esplanade, Port Elliot SA 5212, Australia',
        '1 Main Street, Yankalilla SA 5203, Australia',
        'Unit A, 1 Main Street, Yankalilla SA 5203, Australia'
      ];
      
      wellKnownAddresses.forEach(addr => {
        if (addr.toLowerCase().includes(queryLower)) {
          suggestions.push(addr);
        }
      });
      
      // 7. Add regional variations if query matches region names
      const regionalTerms = {
        'mount': ['Mount Barker', 'Mount Gambier'],
        'port': ['Port Augusta', 'Port Lincoln', 'Port Elliot', 'Port Wakefield', 'Port Macdonnell'],
        'victor': ['Victor Harbor'],
        'murray': ['Murray Bridge'],
        'barossa': ['Tanunda', 'Nuriootpa', 'Angaston'],
        'adelaide hills': ['Stirling', 'Hahndorf', 'Mount Barker', 'Aldgate'],
        'fleuieu': ['Victor Harbor', 'Goolwa', 'Port Elliot'],
        'yorke': ['Kadina', 'Wallaroo', 'Moonta'],
        'eyre': ['Port Lincoln', 'Whyalla', 'Ceduna'],
        'limestone': ['Mount Gambier', 'Naracoorte', 'Penola'],
        'flinders': ['Quorn', 'Hawker', 'Leigh Creek'],
        'riverland': ['Berri', 'Renmark', 'Loxton']
      };
      
      Object.entries(regionalTerms).forEach(([term, suburbs]) => {
        if (queryLower.includes(term)) {
          suburbs.forEach(suburb => {
            const suburbData = SA_ADDRESS_DATABASE.suburbs.find(s => s.name === suburb);
            if (suburbData) {
              // Add multiple address variations
              SA_ADDRESS_DATABASE.houseNumbers.slice(0, 3).forEach(num => {
                suggestions.push(`${num} Main Street, ${suburbData.name} SA ${suburbData.postcode}, Australia`);
                suggestions.push(`${num} Commercial Street, ${suburbData.name} SA ${suburbData.postcode}, Australia`);
                // Add unit variations
                SA_ADDRESS_DATABASE.unitNumbers.slice(0, 2).forEach(unit => {
                  suggestions.push(`${unit}, ${num} Main Street, ${suburbData.name} SA ${suburbData.postcode}, Australia`);
                });
              });
            }
          });
        }
      });
      
      // 8. Remove duplicates and limit results
      const uniqueSuggestions = [...new Set(suggestions)].slice(0, 15);
      
      // 9. If we still don't have enough results, add some realistic South Australia addresses
      if (uniqueSuggestions.length < 8) {
        const realisticAddresses = [
          `${query} Street, Adelaide SA 5000, Australia`,
          `Unit 1, ${query} Street, Adelaide SA 5000, Australia`,
          `${query} Road, North Adelaide SA 5006, Australia`,
          `Shop 1, ${query} Road, North Adelaide SA 5006, Australia`,
          `${query} Avenue, Glenelg SA 5045, Australia`,
          `Unit A, ${query} Avenue, Glenelg SA 5045, Australia`,
          `${query} Drive, Burnside SA 5066, Australia`,
          `Office 1, ${query} Drive, Burnside SA 5066, Australia`,
          `${query} Place, Unley SA 5061, Australia`,
          `Suite 1, ${query} Place, Unley SA 5061, Australia`,
          `${query} Street, Mount Barker SA 5251, Australia`,
          `Unit 2, ${query} Street, Mount Barker SA 5251, Australia`,
          `${query} Road, Victor Harbor SA 5211, Australia`,
          `Unit B, ${query} Road, Victor Harbor SA 5211, Australia`,
          `${query} Avenue, Murray Bridge SA 5253, Australia`,
          `Shop 2, ${query} Avenue, Murray Bridge SA 5253, Australia`
        ];
        
        realisticAddresses.forEach(addr => {
          if (!uniqueSuggestions.includes(addr)) {
            uniqueSuggestions.push(addr);
          }
        });
      }
      
      setAddressSuggestions(uniqueSuggestions.slice(0, 15));
      
    } catch (error) {
      console.warn('Address search error:', error);
      // Secure fallback - only South Australia addresses
      const fallbackAddresses = [
        `${query} Street, Adelaide SA 5000, Australia`,
        `${query} Road, North Adelaide SA 5006, Australia`,
        `${query} Avenue, Glenelg SA 5045, Australia`,
        `${query} Drive, Mount Barker SA 5251, Australia`,
        `${query} Place, Victor Harbor SA 5211, Australia`
      ];
      setAddressSuggestions(fallbackAddresses);
    } finally {
      setIsLoadingAddresses(false);
    }
  }

  // Customer search with autocomplete
  function searchCustomers(query) {
    try {
      if (!query || query.length < 2) {
        setCustomerSuggestions([]);
        return;
      }
      
      // Safety check for customers array
      if (!Array.isArray(customers)) {
        console.warn('Customers is not an array:', customers);
        setCustomerSuggestions([]);
        return;
      }
      
      const filtered = customers.filter(customer => 
        customer?.name?.toLowerCase().includes(query.toLowerCase()) ||
        customer?.phone?.includes(query) ||
        customer?.email?.toLowerCase().includes(query.toLowerCase())
      );
      
      setCustomerSuggestions(filtered);
    } catch (error) {
      console.error('Error in searchCustomers:', error);
      setCustomerSuggestions([]);
    }
  }

  // Select customer and auto-fill details
  function selectCustomer(customer) {
    setForm(prev => ({
      ...prev,
      customerName: customer.name || '',
      customerId: customer.customerId || generateCustomerCode(),
      phone: customer.phone || '',
      customerAddress: customer.address || '',
      customerEmail: customer.email || ''
    }));
    setShowCustomerSuggestions(false);
    setCustomerSuggestions([]); // Clear suggestions after selection
  }

  // Select address suggestion
  function selectAddress(address) {
    setForm(prev => ({ ...prev, customerAddress: address }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]); // Clear suggestions after selection
  }

  // Software validation and save
  function validateSoftwareItem(item) {
    if (!item.name.trim()) {
      alert('Software name is required');
      return false;
    }
    if (isNaN(item.value) || item.value < 0) {
      alert('Software value must be a valid number (0 or greater)');
      return false;
    }
    return true;
  }

  function saveSoftwareItem(index) {
    const item = form.software[index];
    if (!validateSoftwareItem(item)) return;

    const newSavedSoftware = [...savedSoftware];
    newSavedSoftware[index] = { ...item, saved: true };
    setSavedSoftware(newSavedSoftware);
    
    // Show success feedback
    const button = document.querySelector(`[data-software-save="${index}"]`);
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Saved!';
      button.className = button.className.replace('bg-brand-blue', 'bg-green-600');
      setTimeout(() => {
        button.textContent = originalText;
        button.className = button.className.replace('bg-green-600', 'bg-brand-blue');
      }, 2000);
    }
}

  // ----- quick KPIs -----
  const kpi = useMemo(
    () => ({
      total: jobs.length,
      open: jobs.filter((j) => j.status === 'Open').length,
      progress: jobs.filter((j) => j.status === 'In Progress').length,
      completed: jobs.filter((j) => j.status === 'Completed').length,
      closed: jobs.filter((j) => j.status === 'Closed').length,
    }),
    [jobs]
  );

  const filteredJobs = useMemo(() => (
    jobStatusFilter === 'All'
      ? jobs
      : jobs.filter((job) => job.status === jobStatusFilter)
  ), [jobStatusFilter, jobs]);

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <section className="surface mb-6 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Operations Dashboard
                </h1>
                <span className="badge badge-blue">
                  {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Welcome, <span className="text-brand-sky">{who}</span>. Track jobs, requests, invoices, and technician workload.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={() => openNew()} className="btn btn-primary tap-target">
                New Job
              </button>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card label="Total Jobs" value={kpi.total} accent="blue" />
          <Card label="Open" value={kpi.open} accent="sky" />
          <Card label="In Progress" value={kpi.progress} accent="fuchsia" />
          <Card label="Completed" value={kpi.completed} accent="emerald" />
          <Card label="Closed" value={kpi.closed} accent="slate" />
        </div>

        {/* Enhanced Recent Jobs Section */}
        <div className="surface rounded-2xl overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex flex-wrap items-center gap-3 text-xl font-bold text-white">
                <span>Recent Jobs</span>
                <span className="badge badge-blue">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {jobStatusFilter === 'All' ? 'Showing all job statuses.' : `Filtered to ${jobStatusFilter} jobs.`}
              </p>
            </div>

            <label className="w-full sm:max-w-xs">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">Filter by status</span>
              <select
                className="select bg-brand-panel"
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
              >
                {JOB_STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All statuses' : status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {jobs.length === 0 ? (
            <div className="p-4 sm:p-6">
              <StatePanel
                tone={err ? 'error' : loading ? 'loading' : 'empty'}
                title={loading ? 'Loading jobs' : err ? 'Jobs could not load' : 'No Jobs Yet'}
                message={loading ? 'Loading jobs...' : err ? `Error: ${err}` : 'Create your first job to get started!'}
              >
              {!loading && !err && (
                <button
                  onClick={openNew}
                  className="btn btn-primary"
                >
                  Create New Job
                </button>
              )}
              </StatePanel>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-4 sm:p-6">
              <StatePanel
                title="No jobs match this status"
                message={`There are no ${jobStatusFilter} jobs in the current job list.`}
              />
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredJobs.map((j) => (
                <div key={j._id} className="group p-4 transition-all duration-200 hover:bg-white/[0.03] sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-brand-sky">
                            {j.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={j.status} type="status" />
                            <StatusBadge status={j.priority} type="priority" />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <div className="text-xs uppercase text-slate-500">Technician</div>
                          <div className="mt-0.5 truncate font-medium text-slate-100">
                            {j.technician || 'Unassigned'}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <div className="text-xs uppercase text-slate-500">Created</div>
                          <div className="mt-0.5 font-medium text-slate-100">
                            {j.createdAt ? new Date(j.createdAt).toLocaleString() : '—'}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <div className="text-xs uppercase text-slate-500">Phone</div>
                          <div className="mt-0.5 truncate font-medium text-slate-100">
                            {j.phone || '—'}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <div className="text-xs uppercase text-slate-500">Invoice</div>
                          {j.invoice ? (
                            <button
                              type="button"
                              className="mt-0.5 text-left font-semibold text-brand-sky underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
                              onClick={() => nav(`/invoices?q=${encodeURIComponent((j.invoice || '').trim())}`)}
                              title="View Invoice"
                            >
                              {j.invoice}
                            </button>
                          ) : (
                            <div className="mt-0.5 font-medium text-slate-100">—</div>
                          )}
                        </div>
                      </div>

                      {j.description && (
                        <p className="max-w-4xl rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-sm leading-6 text-slate-300 line-clamp-2">
                          {j.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <button
                        onClick={() => openEdit(j)}
                        className="btn btn-blue flex-1 px-3 sm:flex-none sm:px-4 tap-target"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => removeJob(j._id)}
                        className="btn btn-danger flex-1 px-3 sm:flex-none sm:px-4 tap-target"
                      >
                        <span className="text-lg">🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New/Edit Job Modal */}
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
            onClick={(e) => { 
              if (e.target === e.currentTarget) {
                setOpen(false);
              }
            }}
          >
            <div 
              className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1450] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="flex-shrink-0 border-b border-white/10 bg-white/[0.03] px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Job' : 'New Job'}</h3>
                      <StatusBadge status={form.status} type="status" />
                      <StatusBadge status={form.priority} type="priority" />
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      Customer details, scheduling, assignment, software, pricing, and completion records.
                    </p>
                  </div>
                  <button onClick={() => setOpen(false)} className="btn btn-ghost text-sm px-3 py-1">
                    Close
                  </button>
                </div>
              </div>

              {/* scrollable content */}
              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 sm:px-6">
                {/* Customer Details Section */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-soft sm:p-5">
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-lg font-semibold text-brand-sky">Customer Details</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Customer Name with Auto-suggestions */}
                    <Field label="Customer Name *">
                      <div className="relative">
                        <input
                          className="w-full px-3 py-2 rounded-lg border border-white/10"
                          style={{ backgroundColor: '#0c1450' }}
                          value={form.customerName}
                          onChange={(e) => {
                            const name = e.target.value;
                            setForm(prev => ({ ...prev, customerName: name }));
                            // Restore customer search functionality
                            searchCustomers(name);
                            setShowCustomerSuggestions(name.length > 1);
                          }}
                          onFocus={() => {
                            if (form.customerName.length > 1) {
                              searchCustomers(form.customerName);
                              setShowCustomerSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Close suggestions after a short delay to allow clicks
                            setTimeout(() => {
                              setShowCustomerSuggestions(false);
                              setCustomerSuggestions([]);
                            }, 200);
                          }}
                          placeholder="Start typing customer name..."
                        />
                        {showCustomerSuggestions && customerSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-[#0e1036] border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {customerSuggestions.map((customer, index) => (
                              <div
                                key={index}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
                                onClick={() => selectCustomer(customer)}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <div className="font-medium text-white">{customer.name}</div>
                                <div className="text-sm text-slate-300">{customer.phone} • {customer.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Field>

                    {/* Customer Code */}
                    <Field label="Customer Code *">
                      <div className="flex gap-2">
                        <input
                          className="w-full px-3 py-2 rounded-lg border border-white/10"
                          style={{ backgroundColor: '#0c1450' }}
                          value={form.customerId}
                          onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                          placeholder="Customer code"
                          readOnly
                        />
                        <button
                          type="button"
                          className="btn btn-ghost text-sm px-3"
                          onClick={() => setForm(f => ({ ...f, customerId: generateCustomerCode() }))}
                          title="Generate new code"
                        >
                          Generate
                        </button>
                      </div>
                    </Field>

                    {/* Phone */}
                    <Field label="Phone *">
                      <input
                        className="w-full px-3 py-2 rounded-lg border border-white/10"
                        style={{ backgroundColor: '#0c1450' }}
                        value={form.phone}
                        onChange={(e) => {
                          setForm(prev => ({ ...prev, phone: e.target.value }));
                        }}
                        placeholder="Phone number"
                      />
                    </Field>

                    {/* Email (Optional) */}
                    <Field label="Email (Optional)">
                      <input
                        type="email"
                        className="w-full px-3 py-2 rounded-lg border border-white/10"
                        style={{ backgroundColor: '#0c1450' }}
                        value={form.customerEmail}
                        onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                        placeholder="Email address"
                      />
                    </Field>

                    {/* Address with Suggestions */}
                    <div className="md:col-span-2">
                      <Field label="Address *">
                        <div className="relative">
                          <input
                            className="w-full px-3 py-2 rounded-lg border border-white/10"
                        style={{ backgroundColor: '#0c1450' }}
                            value={form.customerAddress}
                            onChange={(e) => {
                              const address = e.target.value;
                              setForm(prev => ({ ...prev, customerAddress: address }));
                              
                              // Clear existing timeout
                              if (addressSearchTimeout) {
                                clearTimeout(addressSearchTimeout);
                              }
                              
                              // Set new timeout for debounced search
                              if (address.length > 2) {
                                const timeout = setTimeout(() => {
                                  getAddressSuggestions(address);
                                  setShowAddressSuggestions(true);
                                }, 500); // 500ms delay
                                setAddressSearchTimeout(timeout);
                              } else {
                                setAddressSuggestions([]);
                                setShowAddressSuggestions(false);
                              }
                            }}
                            onFocus={() => {
                              if (form.customerAddress.length > 2) {
                                getAddressSuggestions(form.customerAddress);
                                setShowAddressSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay hiding suggestions to allow for click on suggestion
                              setTimeout(() => setShowAddressSuggestions(false), 200);
                            }}
                            placeholder="Enter address..."
                          />
                          {showAddressSuggestions && (
                            <div 
                              className="absolute z-10 w-full mt-1 bg-[#0e1036] border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                              onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                            >
                              {isLoadingAddresses ? (
                                <div className="px-3 py-2 text-center">
                                  <div className="text-white text-sm flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Searching addresses...
                                  </div>
                                </div>
                              ) : addressSuggestions.length > 0 ? (
                                addressSuggestions.map((address, index) => (
                                  <div
                                    key={index}
                                    className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors"
                                    onClick={() => selectAddress(address)}
                                  >
                                    <div className="text-white text-sm">{address}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-center">
                                  <div className="text-slate-400 text-sm">No addresses found</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-soft sm:p-5">
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-lg font-semibold text-brand-sky">Job Details</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Job Title */}
                    <Field label="Job Title *">
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                      value={form.title}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, title: e.target.value }));
                      }}
                        placeholder="Job title"
                    />
                  </Field>

                    {/* Invoice Number */}
                    <Field label="Invoice Number *">
                      <input
                        className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value={form.invoice}
                        onChange={(e) => setForm({ ...form, invoice: e.target.value })}
                        placeholder="INV-2026-0001"
                        readOnly
                      />
                    </Field>

                    {/* Priority */}
                  <Field label="Priority">
                    <select
                      className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </Field>

                    {/* Status */}
                  <Field label="Status">
                    <div className="flex items-center gap-2">
                      <select
                        className="flex-1 px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        disabled={form.status === 'Closed'}
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        {/* Closed is not in dropdown - use Close Job button */}
                      </select>
                      {/* Close Job button - only for Completed jobs */}
                      {form.status === 'Completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Close this job? It will be archived. You can reopen it later if needed.')) {
                              setForm({ ...form, status: 'Closed' });
                            }
                          }}
                          className="btn btn-warning text-sm px-3 whitespace-nowrap"
                        >
                          Close Job
                        </button>
                      )}
                      {/* Reopen Job button - only for Closed jobs */}
                      {form.status === 'Closed' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Reopen this job? It will return to Completed status.')) {
                              setForm({ ...form, status: 'Completed' });
                            }
                          }}
                          className="btn btn-blue text-sm px-3 whitespace-nowrap"
                        >
                          Reopen Job
                        </button>
                      )}
                    </div>
                    {/* Closed status indicator */}
                    {form.status === 'Closed' && (
                      <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/30 text-green-200 text-xs flex items-center gap-2">
                        <span>🔒</span>
                        <span>Job is closed and archived</span>
                      </div>
                    )}
                  </Field>

                    {/* Technician */}
                  <Field label="Technician">
                    <input
                      list="techList"
                      className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                      value={form.technician}
                      onChange={(e) => {
                        setForm({ ...form, technician: e.target.value });
                        setConfirmedAssignmentWithoutAccount(false); // Reset confirmation when tech changes
                      }}
                        placeholder="Assign technician..."
                      autoComplete="off"
                    />
                    <datalist id="techList">
                      {techOptions.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                    {/* Tech list load failure warning */}
                    {techs.length === 0 && form.technician && (
                      <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">⚠️</span>
                          <div>
                            <p className="font-medium">Technician account safety data unavailable</p>
                            <p className="text-red-300/80 text-xs mt-1">
                              Could not load technician list. Assignment safety checks are disabled.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warning: unknown technician (not in system) */}
                    {form.technician && techs.length > 0 && !isKnownTechnician && (
                      <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">⚠️</span>
                          <div>
                            <p className="font-medium">Unknown technician</p>
                            <p className="text-red-300/80 text-xs mt-1">
                              "{form.technician}" is not in the technician list. Please create this technician first or select an existing one.
                            </p>
                            {!confirmedAssignmentWithoutAccount && (
                              <button
                                type="button"
                                onClick={() => setConfirmedAssignmentWithoutAccount(true)}
                                className="btn btn-danger mt-2 text-xs px-3 py-1"
                              >
                                I understand, assign anyway
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warning: known technician has no login account */}
                    {form.technician && isKnownTechnician && !selectedTechHasAccount && (
                      <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400">⚠️</span>
                          <div>
                            <p className="font-medium">This technician does not have a login account</p>
                            <p className="text-amber-300/80 text-xs mt-1">
                              They will not be able to access /tech-view until an admin creates a login account for them.
                            </p>
                            {!confirmedAssignmentWithoutAccount && (
                              <button
                                type="button"
                                onClick={() => setConfirmedAssignmentWithoutAccount(true)}
                                className="btn btn-warning mt-2 text-xs px-3 py-1"
                              >
                                I understand, assign anyway
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Confirmation shown when acknowledged */}
                    {form.technician && !selectedTechHasAccount && confirmedAssignmentWithoutAccount && (
                      <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                        <span>✓</span> Assignment to technician without account confirmed
                      </div>
                    )}
                  </Field>

                    {/* Job Description */}
                  <div className="md:col-span-2">
                      <Field label="Job Description *">
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-white/10"
                        style={{ backgroundColor: '#0c1450' }}
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                          placeholder="Describe the job requirements..."
                      />
                    </Field>
                    </div>
                  </div>
                  </div>

                {/* Software Section */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-soft sm:p-5">
                  <h4 className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 text-lg font-semibold text-brand-sky">
                    <span>💿</span> Software
                  </h4>
                  <div className="space-y-3">
                    {form.software.map((item, index) => (
                      <div key={index} className="border border-white/10 rounded-lg p-4 bg-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <div className="md:col-span-1">
                            <Field label="Software Name *">
  <input
                                className={`w-full px-3 py-2 rounded-lg bg-transparent border ${
                                  item.name.trim() ? 'border-white/10' : 'border-yellow-500/50'
                                }`}
                                value={item.name}
                                onChange={(e) => {
                                  const newSoftware = [...form.software];
                                  newSoftware[index] = { name: String(e.target.value), value: item.value };
                                  setForm({ ...form, software: newSoftware });
                                }}
                                placeholder="Software name"
                                required
  />
</Field>
                          </div>
                          <div className="md:col-span-1">
                            <Field label="Value ($) *">
                              <input
                                type="number"
                                step="1"
                                min="0"
                                className={`w-full px-3 py-2 rounded-lg bg-transparent border ${
                                  !isNaN(item.value) && item.value >= 0 ? 'border-white/10' : 'border-yellow-500/50'
                                } [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                value={item.value}
                                onChange={(e) => {
                                  const newSoftware = [...form.software];
                                  const inputValue = e.target.value;
                                  // Allow empty string for deletion, convert to number only when not empty
                                  const numericValue = inputValue === '' ? '' : (parseInt(inputValue) || 0);
                                  newSoftware[index] = { name: String(item.name), value: numericValue };
                                  setForm({ ...form, software: newSoftware });
                                  // Recalculate total price when software value changes
                                  const softwareTotal = newSoftware.reduce((sum, s) => sum + (typeof s.value === 'number' ? s.value : 0), 0);
                                  const additionalTimePrice = getExtraPrice(form.additionalMins || 0);
                                  const timePrice = BASE_PRICE + additionalTimePrice;
                                  const subtotal = timePrice + softwareTotal;
                                  let total = subtotal;
                                  if (form.pensionYearDiscount) total *= 0.9;
                                  if (form.socialMediaDiscount) total *= 0.95;
                                  setForm(prev => ({ ...prev, amount: total }));
                                }}
                                placeholder="0"
                                required
                              />
                            </Field>
                          </div>
                          <div className="md:col-span-1 flex gap-2">
                            <button
                              type="button"
                              data-software-save={index}
                              className="btn btn-blue flex-1 px-3"
                              onClick={() => saveSoftwareItem(index)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger px-3"
                              onClick={() => {
                                const newSoftware = form.software.filter((_, i) => i !== index);
                                // Recalculate total price when removing software
                                const softwareTotal = newSoftware.reduce((sum, s) => sum + (typeof s.value === 'number' ? s.value : 0), 0);
                                const additionalTimePrice = getExtraPrice(form.additionalMins || 0);
                                const timePrice = BASE_PRICE + additionalTimePrice;
                                const subtotal = timePrice + softwareTotal;
                                let total = subtotal;
                                if (form.pensionYearDiscount) total *= 0.9;
                                if (form.socialMediaDiscount) total *= 0.95;
                                
                                setForm({ 
                                  ...form, 
                                  software: newSoftware,
                                  amount: total
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        {savedSoftware[index]?.saved && (
                          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                            <span>✓</span> Software item saved
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        const newSoftware = [...form.software, { name: '', value: 0 }];
                        // Recalculate total price when adding software
                        const softwareTotal = newSoftware.reduce((sum, s) => sum + (typeof s.value === 'number' ? s.value : 0), 0);
                        const additionalTimePrice = getExtraPrice(form.additionalMins || 0);
                        const timePrice = BASE_PRICE + additionalTimePrice;
                        const subtotal = timePrice + softwareTotal;
                        let total = subtotal;
                        if (form.pensionYearDiscount) total *= 0.9;
                        if (form.socialMediaDiscount) total *= 0.95;
                        
                        setForm({
                          ...form,
                          software: newSoftware,
                          amount: total
                        });
                      }}
                    >
                      + Add Software
                    </button>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-soft sm:p-5">
                  <h4 className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 text-lg font-semibold text-brand-sky">
                    <span>💰</span> Pricing
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Base Time */}
                    <Field label="Base Time">
  <input
    className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
    value="2 hours"
    readOnly
  />
</Field>

                    {/* Base Price */}
                    <Field label="Base Price">
  <input
    className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value="$165.00"
    readOnly
  />
</Field>

                    {/* Additional Time */}
                    <Field label="Additional Time">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="px-3 py-2 rounded-lg bg-transparent border border-white/10"
                          value={Math.floor((form.additionalMins || 0) / 60)}
                          onChange={(e) => {
                            const hours = parseInt(e.target.value) || 0;
                            const minutes = (form.additionalMins || 0) % 60;
                            const totalMinutes = hours * 60 + minutes;
                            const endAt = form.startAt ? addMinutesISO(form.startAt, 120 + totalMinutes) : '';
                            const softwareTotal = form.software.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
                            const additionalTimePrice = getExtraPrice(totalMinutes);
                            const timePrice = BASE_PRICE + additionalTimePrice;
                            const subtotal = timePrice + softwareTotal;
                            let total = subtotal;
                            if (form.pensionYearDiscount) total *= 0.9;
                            if (form.socialMediaDiscount) total *= 0.95;
                            setForm({ ...form, additionalMins: totalMinutes, endAt, amount: total });
                          }}
                        >
                          {Array.from({ length: 13 }, (_, i) => (
                            <option key={i} value={i}>
                              {i} {i === 1 ? 'hour' : 'hours'}
                            </option>
                          ))}
  </select>
                        <select
                          className="px-3 py-2 rounded-lg bg-transparent border border-white/10"
                          value={(form.additionalMins || 0) % 60}
                          onChange={(e) => {
                            const minutes = parseInt(e.target.value) || 0;
                            const hours = Math.floor((form.additionalMins || 0) / 60);
                            const totalMinutes = hours * 60 + minutes;
                            const endAt = form.startAt ? addMinutesISO(form.startAt, 120 + totalMinutes) : '';
                            const softwareTotal = form.software.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
                            const additionalTimePrice = getExtraPrice(totalMinutes);
                            const timePrice = BASE_PRICE + additionalTimePrice;
                            const subtotal = timePrice + softwareTotal;
                            let total = subtotal;
                            if (form.pensionYearDiscount) total *= 0.9;
                            if (form.socialMediaDiscount) total *= 0.95;
                            setForm({ ...form, additionalMins: totalMinutes, endAt, amount: total });
                          }}
                        >
                          <option value={0}>0 mins</option>
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={45}>45 mins</option>
                        </select>
                      </div>
</Field>

                    {/* Scheduling */}
                    <Field label="Start Time">
  <input
    type="datetime-local"
    className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value={toLocal(form.startAt)}
    onChange={e => {
                          const startAt = fromLocal(e.target.value);
                          const endAt = addMinutesISO(startAt, 120 + Number(form.additionalMins || 0));
                          setForm({ ...form, startAt, endAt });
                        }}
  />
</Field>

                    <Field label="End Time">
  <input
                        type="datetime-local"
    className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10"
                        value={toLocal(form.endAt)}
    readOnly
  />
</Field>

                    {/* Discounts */}
                    <div className="md:col-span-2">
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
  <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/10 bg-transparent text-brand-sky focus:ring-brand-sky"
                            checked={form.pensionYearDiscount}
                            onChange={(e) => {
                              const pensionDiscount = e.target.checked;
                              const softwareTotal = form.software.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
                              const additionalTimePrice = getExtraPrice(form.additionalMins || 0);
                              const timePrice = BASE_PRICE + additionalTimePrice;
                              const subtotal = timePrice + softwareTotal;
                              let total = subtotal;
                              if (pensionDiscount) total *= 0.9;
                              if (form.socialMediaDiscount) total *= 0.95;
                              setForm({ ...form, pensionYearDiscount: pensionDiscount, amount: total });
                            }}
                          />
                          <span className="text-white">Pension Year Discount (10% off total)</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/10 bg-transparent text-brand-sky focus:ring-brand-sky"
                            checked={form.socialMediaDiscount}
                            onChange={(e) => {
                              const socialDiscount = e.target.checked;
                              const softwareTotal = form.software.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
                              const additionalTimePrice = getExtraPrice(form.additionalMins || 0);
                              const timePrice = BASE_PRICE + additionalTimePrice;
                              const subtotal = timePrice + softwareTotal;
                              let total = subtotal;
                              if (form.pensionYearDiscount) total *= 0.9;
                              if (socialDiscount) total *= 0.95;
                              setForm({ ...form, socialMediaDiscount: socialDiscount, amount: total });
                            }}
                          />
                          <span className="text-white">Following on Social Media Discount (5% off total)</span>
                        </label>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="md:col-span-2">
                      <Field label="Total Price">
                        <div className="text-2xl font-bold text-brand-green">
                          {currency.format(form.amount || 0)}
                        </div>
                        <div className="text-sm text-slate-300 mt-1">
                          Base: $165.00 + Additional Time: $${getExtraPrice(form.additionalMins || 0).toFixed(2)} + Software: ${form.software.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0).toFixed(2)}
                          {(form.pensionYearDiscount || form.socialMediaDiscount) && (
                            <span className="text-brand-sky"> (with discounts applied)</span>
                          )}
                        </div>
</Field>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting Section (Admin/Technician Only) */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-soft sm:p-5">
                  <h4 className="mb-4 flex flex-wrap items-center gap-3 border-b border-white/10 pb-3 text-lg font-semibold text-brand-sky">
                    <span>🔧</span> Troubleshooting & Resolution
                    <span className="badge badge-amber">Admin/Technician Only</span>
                  </h4>
                  <div>
                    <Field label="Troubleshooting Steps & Resolution">
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-white/10"
                        style={{ backgroundColor: '#0c1450' }}
                        rows={6}
                        value={form.troubleshooting}
                        onChange={(e) => setForm({ ...form, troubleshooting: e.target.value })}
                        placeholder="Describe troubleshooting steps taken and final resolution..."
                      />
                      <div className="text-xs text-slate-400 mt-1">
                        Include both the troubleshooting process and the final resolution in this field.
                    </div>
                  </Field>
                  </div>
                </div>

                {/* Job Events Timeline (Read-only) */}
                {editingId && (
                  <div className="rounded-2xl border border-slate-400/20 bg-slate-500/[0.04] p-4 shadow-soft sm:p-5">
                    <h4 className="mb-4 flex flex-wrap items-center gap-3 border-b border-white/10 pb-3 text-lg font-semibold text-sky-300">
                      <span>Job Events Timeline</span>
                      <span className="badge badge-slate">
                        {timelineEvents.length} {timelineEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    </h4>

                    {timelineEvents.length === 0 ? (
                      <StatePanel
                        compact
                        title="No timeline events"
                        message="No timeline events recorded yet for this job."
                      />
                    ) : (
                      <div className="max-h-80 overflow-y-auto pr-2">
                        <div className="space-y-4">
                          {timelineEvents.map((event, idx) => {
                            const meta = getEventMeta(event?.type);
                            const eventTs = event?.timestamp || event?.createdAt;
                            const fullTimestamp = eventTs ? new Date(eventTs).toLocaleString() : 'Unknown time';

                            return (
                              <div key={`${event?.type || 'event'}-${eventTs || idx}-${idx}`} className="relative pl-7">
                                {idx < timelineEvents.length - 1 && (
                                  <span className="absolute left-[7px] top-6 bottom-[-14px] w-px bg-white/10" />
                                )}
                                <span className={`absolute left-0 top-1 h-4 w-4 rounded-full border ${meta.dotClass}`} />

                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`badge badge-sm ${meta.badgeClass}`}>
                                          {meta.label}
                                        </span>
                                        <span className="text-sm text-slate-200 font-medium">
                                          {event?.actorName || 'System'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-300 mt-2 break-words">
                                        {renderEventDetails(event)}
                                      </p>
                                    </div>
                                    <span
                                      className="text-xs text-slate-400 whitespace-nowrap"
                                      title={fullTimestamp}
                                    >
                                      {formatRelativeTime(eventTs)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Completion Evidence Section (Read-only - shown when technician actually submitted evidence) */}
                {editingId && form.completionForm?.submittedAt && (
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-4 shadow-soft sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <h4 className="flex items-center gap-3 text-lg font-semibold text-green-400">
                        <span>📋</span> Completion Evidence
                        <span className="badge badge-emerald">Technician Submitted</span>
                      </h4>
                      <button
                        type="button"
                        onClick={downloadCompletionReport}
                        className="btn btn-success text-sm"
                      >
                        Download Report
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Show a note that this is read-only */}
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-green-200 text-sm mb-4">
                        <span className="font-medium">Review before closing:</span> This evidence was submitted by the technician when marking the job complete. It cannot be edited.
                      </div>

                      {/* Work Performed */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Work Performed</label>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-slate-200 whitespace-pre-wrap">
                          {form.completionForm?.workPerformed || (
                            <span className="text-slate-500 italic">No completion form submitted</span>
                          )}
                        </div>
                      </div>

                      {/* Parts Used */}
                      {form.completionForm?.partsUsed && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Parts/Materials Used</label>
                          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-slate-200">
                            {form.completionForm.partsUsed}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Required */}
                      {form.completionForm?.followUpRequired && (
                        <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-amber-400 text-lg">⚠️</span>
                            <span className="font-medium text-amber-400">Follow-up Required</span>
                          </div>
                          <p className="text-slate-300">{form.completionForm.followUpNotes}</p>
                        </div>
                      )}

                      {/* Photos */}
                      {form.completionPhotos && form.completionPhotos.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Evidence Photos ({form.completionPhotos.length})
                          </label>
                          <div className="flex gap-3 flex-wrap">
                            {form.completionPhotos.map((photo, idx) => (
                              <a
                                key={idx}
                                href={photo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-24 h-24 rounded-lg overflow-hidden border border-slate-600 hover:border-green-400 transition"
                              >
                                <img
                                  src={photo.url}
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Submitted Info */}
                      {form.completionForm?.submittedAt && (
                        <p className="text-slate-500 text-xs pt-2 border-t border-white/10">
                          Submitted: {new Date(form.completionForm.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* sticky footer */}
              <div className="flex-shrink-0 border-t border-white/10 bg-white/[0.03] px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-h-10">
                    {editingId && (
                      <button
                        onClick={() => removeJob(editingId)}
                        className="btn btn-danger"
                      >
                        Delete Job
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => setOpen(false)}
                      className="btn btn-ghost w-full px-6 sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={save}
                      className="btn btn-primary w-full px-6 sm:w-auto"
                    >
                      {editingId ? 'Save Job' : 'Create Job'} - {currency.format(
                        form.amount || (BASE_PRICE + getExtraPrice(Number(form.additionalMins)||0))
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Card({ label, value, accent = 'default' }) {
  const accents = {
    default: {
      panel: 'from-white/5 to-white/[0.02] border-white/10 hover:border-white/20',
      marker: 'bg-slate-300',
      glow: 'bg-white/10',
    },
    blue: {
      panel: 'from-blue-500/15 to-blue-500/[0.03] border-blue-400/20 hover:border-blue-300/35',
      marker: 'bg-blue-300',
      glow: 'bg-blue-400/15',
    },
    sky: {
      panel: 'from-sky-500/15 to-sky-500/[0.03] border-sky-400/20 hover:border-sky-300/35',
      marker: 'bg-sky-300',
      glow: 'bg-sky-400/15',
    },
    teal: {
      panel: 'from-teal-500/15 to-teal-500/[0.03] border-teal-400/20 hover:border-teal-300/35',
      marker: 'bg-teal-300',
      glow: 'bg-teal-400/15',
    },
    fuchsia: {
      panel: 'from-fuchsia-500/15 to-fuchsia-500/[0.03] border-fuchsia-400/20 hover:border-fuchsia-300/35',
      marker: 'bg-fuchsia-300',
      glow: 'bg-fuchsia-400/15',
    },
    emerald: {
      panel: 'from-emerald-500/15 to-emerald-500/[0.03] border-emerald-400/20 hover:border-emerald-300/35',
      marker: 'bg-emerald-300',
      glow: 'bg-emerald-400/15',
    },
    slate: {
      panel: 'from-slate-500/15 to-slate-500/[0.03] border-slate-400/20 hover:border-slate-300/30',
      marker: 'bg-slate-300',
      glow: 'bg-slate-400/10',
    },
  };
  const tone = accents[accent] || accents.default;

  return (
    <div className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border bg-gradient-to-br p-3.5 sm:p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${tone.panel}`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${tone.marker}`} />
      <div className={`absolute right-3 top-3 h-9 w-9 rounded-full blur-xl transition-opacity duration-200 group-hover:opacity-90 ${tone.glow}`} />
      <div className="relative flex min-h-[5.5rem] flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-xs font-semibold uppercase text-slate-300">
            {label}
          </div>
          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${tone.marker}`} />
        </div>
        <div className="text-3xl font-extrabold leading-none text-white">
          {value}
        </div>
      </div>
    </div>
  );
}

function StatePanel({ title, message, tone = 'empty', compact = false, children }) {
  const tones = {
    empty: 'border-white/10 bg-white/[0.04] text-slate-300',
    loading: 'border-brand-sky/25 bg-brand-sky/10 text-sky-100',
    error: 'border-rose-400/35 bg-rose-500/10 text-rose-100',
  };

  return (
    <div className={`surface rounded-2xl ${compact ? 'p-4 text-left' : 'p-6 text-center sm:p-8'} ${tones[tone] || tones.empty}`}>
      <div className="mx-auto mb-3 h-1 w-16 rounded-full bg-brand-sky/60" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}

function StatusBadge({ status, type = 'status' }) {
  const styles = {
    status: {
      'Open': 'badge-blue',
      'Assigned': 'badge-blue',
      'Accepted': 'badge-sky',
      'Scheduled': 'badge-sky',
      'En Route': 'badge-amber',
      'On Site': 'badge-orange',
      'In Progress': 'badge-fuchsia',
      'Completed': 'badge-emerald',
      'Closed': 'badge-slate',
    },
    priority: {
      'Low': 'badge-slate',
      'Medium': 'badge-amber',
      'High': 'badge-orange',
      'Urgent': 'badge-rose',
    },
  };

  const statusStyle = styles[type][status] || styles[type]['Open'];

  return (
    <span className={`badge ${statusStyle}`}>
      {status}
    </span>
  );
}

function Field({ label, children, className = '' }) {
  const isRequired = typeof label === 'string' && label.trim().endsWith('*');
  const displayLabel = isRequired ? label.replace(/\s*\*$/, '') : label;

  return (
    <label className={`block ${className}`}>
      <div className="mb-1 flex items-center gap-1 text-sm font-medium text-slate-300">
        <span>{displayLabel}</span>
        {isRequired && <span className="text-rose-300">*</span>}
      </div>
      {children}
    </label>
  );
}
