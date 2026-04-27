import { useState } from "react";
import { portal } from "../lib/portal";
import Button from "./atoms/Button";

export default function BookingForm() {
  const [form, setForm] = useState({
    title: "", description: "", customerName: "",
    phone: "", suburb: "", date: "", time: "", additionalMins: 0,
  });
  const [msg, setMsg] = useState("");

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Submitting…");
    try {
      const startAt = new Date(`${form.date}T${form.time}`).toISOString();
      const result = await portal.createPublicJob({
        title: form.title,
        description: form.description,
        customerName: form.customerName,
        phone: form.phone,
        suburb: form.suburb,
        startAt,
        additionalMins: Number(form.additionalMins) || 0,
      });
      setMsg(`Success! Job ID: ${result.id}`);
    } catch (err) {
      setMsg(`Failed: ${err.message || err}`);
    }
  }

  return (
      <form onSubmit={onSubmit} className="grid max-w-md gap-4 rounded-[40px] border border-slate-200/60 bg-white p-6 md:p-8">
        <input className="w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" placeholder="Issue title" required
          value={form.title} onChange={e=>update("title", e.target.value)} />
        <textarea className="w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" placeholder="Description"
        value={form.description} onChange={e=>update("description", e.target.value)} />
        <input className="w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" placeholder="Customer name" required
          value={form.customerName} onChange={e=>update("customerName", e.target.value)} />
        <input className="w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" placeholder="Phone" required
          value={form.phone} onChange={e=>update("phone", e.target.value)} />
        <input className="w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" placeholder="Suburb"
          value={form.suburb} onChange={e=>update("suburb", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
     <input className="w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" type="date" required
       value={form.date} onChange={e=>update("date", e.target.value)} />
     <input className="w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" type="time" required
       value={form.time} onChange={e=>update("time", e.target.value)} />
      </div>
      <label className="text-sm">
        Extra minutes (0/15/30/45/60)
     <input className="mt-1 w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue" type="number"
               min="0" max="60" step="15"
               value={form.additionalMins}
               onChange={e=>update("additionalMins", e.target.value)} />
      </label>
        <Button type="submit" variant="primary" className="w-full justify-center py-3">
     Book technician
        </Button>
        <div className="text-sm text-slate-600">{msg}</div>
    </form>
  );
}
