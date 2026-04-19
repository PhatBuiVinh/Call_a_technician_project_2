import { useState } from "react";
import Input from "../components/atoms/Input";
import Textarea from "../components/atoms/Textarea";
import Button from "../components/atoms/Button";

export default function Booking() {
  const [form, setForm] = useState({
    service_type: "",
    name: "",
    phone: "",
    suburb: "",
    preferred_time: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [statusMsg, setStatusMsg] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.service_type.trim()) e.service_type = "Please enter a service type";
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    setStatusMsg("Booking flow is being connected. Please use Contact for immediate scheduling.");
    setForm({
      service_type: "",
      name: "",
      phone: "",
      suburb: "",
      preferred_time: "",
      description: "",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Book a Technician</h1>
      <p className="mt-2 text-slate-600">Tell us what you need and when works for you.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <Input
          label="Service Type"
          name="service_type"
          placeholder="e.g., Laptop repair, Wi‑Fi setup"
          value={form.service_type}
          onChange={onChange}
          error={errors.service_type}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={onChange}
            error={errors.name}
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            error={errors.phone}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Suburb"
            name="suburb"
            value={form.suburb}
            onChange={onChange}
            helpText="Optional"
          />
          <Input
            label="Preferred Time"
            name="preferred_time"
            type="datetime-local"
            value={form.preferred_time}
            onChange={onChange}
            helpText="Optional"
          />
        </div>
        <Textarea
          label="Describe the Issue"
          name="description"
          value={form.description}
          onChange={onChange}
          helpText="Any details help the technician prepare"
        />

        <div className="flex gap-3">
          <Button type="submit">Submit Booking</Button>
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
        {statusMsg && <p className="text-sm text-slate-600">{statusMsg}</p>}
      </form>
    </div>
  );
}
