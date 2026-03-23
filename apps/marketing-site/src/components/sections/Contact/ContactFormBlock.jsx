import { useEffect, useMemo, useRef, useState } from "react";
import Section from "../../layout/Section";
import Input from "../../atoms/Input";
import Textarea from "../../atoms/Textarea";
import Button from "../../atoms/Button";
import { portal } from "../../../lib/portal"; // NEW: API helper import

// Minimal SA suburbs list (add more anytime)
const SA_SUBURBS = [
  "Adelaide", "Glenelg", "Henley Beach", "Semaphore", "Prospect", "Norwood",
  "Unley", "Mawson Lakes", "Tea Tree Gully", "Modbury", "Golden Grove",
  "Burnside", "Goodwood", "Mitcham", "Blackwood", "Fulham", "West Lakes",
  "Woodville", "Torrensville", "Kensington", "Parkside", "Campbelltown",
  "Newton", "Magill", "Paradise", "Salisbury", "Elizabeth", "Munno Para"
];

const MAX_MSG = 800;
const MAX_FILES = 3;
const MAX_MB = 5;
const DRAFT_KEY = "contact_form_draft_v1";

export default function ContactFormBlock() {
  // form state
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    suburb: "",
    time: "",
    preferredAt: "",
    message: "",
    website: "", // honeypot
  });

  // uploads
  const [files, setFiles] = useState([]); // [{file,url,error?}]
  const [dragOver, setDragOver] = useState(false);

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false); // you can toggle a modal using this
  const [serverError, setServerError] = useState("");
  const [jobRef, setJobRef] = useState(""); // NEW: show job reference if backend returns it

  // validators
  const emailOk = (s) => /^\S+@\S+\.\S+$/.test(s);
  const phoneOk = (s) => /^(\+?61|0)?[2-478]\d{8}$/.test(s.replace(/\s/g, ""));

  const errors = useMemo(() => {
    const e = {};
    if (!values.name || values.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!values.phone || !phoneOk(values.phone)) e.phone = "Please enter a valid AU phone number.";
    if (values.email && !emailOk(values.email)) e.email = "Email looks invalid.";
    if (!values.message || values.message.trim().length < 10) e.message = "Tell us a bit more (10+ chars).";
    if (values.preferredAt) {
      const dt = new Date(values.preferredAt);
      if (Number.isNaN(dt.getTime())) e.preferredAt = "Please pick a valid date/time.";
    }
    if (values.website) e.website = "Spam detected.";
    if (values.message.length > MAX_MSG) e.message = `Message too long (max ${MAX_MSG} chars).`;
    if (files.some((f) => f.error)) e.files = "Some uploads are invalid.";
    return e;
  }, [values, files]);

  const hasErrors = Object.keys(errors).length > 0;

  // refs for scroll-to-error
  const refs = {
    name: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    message: useRef(null),
    preferredAt: useRef(null),
  };

  // -------- Enhancements --------
  // A) Draft autosave/restore
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setValues((v) => ({ ...v, ...parsed, website: "" })); // never restore honeypot
      }
    } catch {}
  }, []);
  useEffect(() => {
    // do not save honeypot or files
    const { website, ...safe } = values;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(safe));
  }, [values]);

  // B) Phone auto-format (+61 or 04xx xxx xxx)
  function formatPhoneAU(raw) {
    const s = raw.replace(/\D+/g, "");
    // Handle +61 and 0-leading loosely; keep readable grouping
    if (s.startsWith("61")) {
      if (s.length <= 11) return `+61 ${s.slice(2,3)}${s.slice(3,5)} ${s.slice(5,8)} ${s.slice(8,11)}`.trim();
      return `+61 ${s.slice(2,4)} ${s.slice(4,7)} ${s.slice(7,10)}`.trim();
    }
    if (s.startsWith("04")) {
      return s.length <= 10
        ? `${s.slice(0,4)} ${s.slice(4,7)} ${s.slice(7,10)}`.trim()
        : `${s.slice(0,4)} ${s.slice(4,7)} ${s.slice(7,10)}`;
    }
    if (s.startsWith("08")) {
      return s.length <= 10
        ? `${s.slice(0,2)} ${s.slice(2,4)} ${s.slice(4,6)} ${s.slice(6,10)}`.trim()
        : `${s.slice(0,2)} ${s.slice(2,6)} ${s.slice(6,10)}`;
    }
    return raw; // fallback for partial input
  }

  function onChange(key) {
    return (e) => {
      let val = e.target.value;
      if (key === "phone") val = formatPhoneAU(val);
      setValues((v) => ({ ...v, [key]: val }));
      if (!touched[key]) setTouched((t) => ({ ...t, [key]: true }));
      setSuccess(false);
      setServerError("");
      setJobRef("");
    };
  }

  // C) Drag-and-drop uploads
  function onSelectFiles(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    addFiles(picked);
    e.target.value = "";
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const picked = Array.from(e.dataTransfer?.files || []);
    addFiles(picked);
  }
  function addFiles(picked) {
    const next = [...files];
    for (const file of picked) {
      if (next.length >= MAX_FILES) break;
      const typeOk = file.type.startsWith("image/");
      const sizeOk = file.size <= MAX_MB * 1024 * 1024;
      const url = URL.createObjectURL(file);
      next.push({ file, url, error: !typeOk ? "Only images are allowed." : !sizeOk ? `Max ${MAX_MB}MB per file.` : "" });
    }
    setFiles(next);
  }
  function removeFile(idx) {
    setFiles((arr) => {
      const copy = [...arr];
      const [removed] = copy.splice(idx, 1);
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  // SUBMIT: replaced to call Portal API (no more fake demo delay)
  async function onSubmit(e) {
    e.preventDefault();
    setTouched((t) => ({ ...t, name: true, phone: true, email: true, suburb: true, time: true, preferredAt: true, message: true }));
    if (hasErrors) {
      const first = ["name", "phone", "email", "preferredAt", "message"].find((k) => errors[k]);
      if (first && refs[first]?.current) refs[first].current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setServerError("");
    setSuccess(false);
    setJobRef("");

    try {
      // Backend expects:
      // { fullName, phone, email?, description, images? }
      const descriptionParts = [
        values.message,
        values.suburb ? `Suburb: ${values.suburb}` : null,
        values.time ? `Preferred time notes: ${values.time}` : null,
        values.preferredAt
          ? `Preferred date/time: ${new Date(values.preferredAt).toISOString()}`
          : null,
      ].filter(Boolean);

      const payload = {
        fullName: values.name.trim(),
        phone: values.phone.trim(),
        email: (values.email || '').trim(),
        description: descriptionParts.join('\n'),
        images: [], // this form currently does not convert uploads to base64
      };

      const res = await portal.submitJobRequest(payload);

      setSubmitting(false);
      setSuccess(true);
      if (res?.id) setJobRef(`Reference: ${res.id}`);

      // Clear form, previews, and draft (same behavior as before)
      files.forEach((f) => f?.url && URL.revokeObjectURL(f.url));
      setFiles([]);
      setValues({ name: "", phone: "", email: "", suburb: "", time: "", preferredAt: "", message: "", website: "" });
      setTouched({});
      localStorage.removeItem(DRAFT_KEY);

    } catch (err) {
      setSubmitting(false);
      setServerError(err?.message || "Failed to submit. Please try again.");
    }
  }

  return (
    <Section>
      <div className="container-app grid lg:grid-cols-2 gap-8 items-start">
        {/* Form card */}
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-xl font-semibold text-brand-navy">Tell us a bit about the issue</h2>
          <p className="text-sm text-slate-600 mt-1">
            We’ll get back to you within business hours (usually sooner).
          </p>

          {/* Success banner (now real, not demo) */}
          {success && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Thanks! Your request was submitted. We’ll contact you shortly.
              {jobRef ? <div className="mt-1 text-emerald-700">{jobRef}</div> : null}
            </div>
          )}
          {serverError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
            {/* Honeypot */}
            <div className="hidden">
              <label>
                If you are a human, leave this field empty
                <input type="text" name="website" value={values.website} onChange={onChange("website")} tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div ref={refs.name}>
                <Input
                  label="Full name"
                  placeholder="Your name"
                  required
                  value={values.name}
                  onChange={onChange("name")}
                  aria-invalid={!!(touched.name && errors.name)}
                  aria-describedby={touched.name && errors.name ? "err-name" : undefined}
                  title="Your full name helps us address you correctly"
                />
                {touched.name && errors.name && <p id="err-name" className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div ref={refs.phone}>
                <Input
                  label="Phone"
                  placeholder="e.g., 04xx xxx xxx"
                  required
                  value={values.phone}
                  onChange={onChange("phone")}
                  aria-invalid={!!(touched.phone && errors.phone)}
                  aria-describedby={touched.phone && errors.phone ? "err-phone" : undefined}
                  title="Mobile preferred for same-day scheduling"
                />
                {touched.phone && errors.phone && <p id="err-phone" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div ref={refs.email}>
              <Input
                label="Email (optional)"
                type="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={onChange("email")}
                aria-invalid={!!(touched.email && errors.email)}
                aria-describedby={touched.email && errors.email ? "err-email" : undefined}
              />
              {touched.email && errors.email && <p id="err-email" className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Suburb with datalist */}
              <div>
                <label className="block text-sm text-slate-700">
                  Suburb
                  <input
                    list="sa-suburbs"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lightblue/60"
                    placeholder="e.g., Glenelg"
                    value={values.suburb}
                    onChange={onChange("suburb")}
                  />
                  <datalist id="sa-suburbs">
                    {SA_SUBURBS.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </label>
              </div>

              <Input
                label="Preferred time (notes)"
                placeholder="e.g., today after 3pm"
                value={values.time}
                onChange={onChange("time")}
              />
            </div>

            {/* Native date/time — optional */}
            <div ref={refs.preferredAt}>
              <label className="block text-sm text-slate-700">
                Preferred date & time (optional)
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lightblue/60"
                  value={values.preferredAt}
                  onChange={onChange("preferredAt")}
                  min={getLocalNowForInput()}
                />
              </label>
              {touched.preferredAt && errors.preferredAt && (
                <p className="mt-1 text-xs text-red-600">{errors.preferredAt}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">We’ll try our best to book this time (subject to availability).</p>
            </div>

            {/* Message + counter */}
            <div ref={refs.message}>
              <Textarea
                label="How can we help?"
                rows={5}
                placeholder="Describe the problem…"
                value={values.message}
                onChange={onChange("message")}
                aria-invalid={!!(touched.message && errors.message)}
                aria-describedby={touched.message && errors.message ? "err-message" : undefined}
              />
              <div className="mt-1 flex items-center justify-between">
                {touched.message && errors.message
                  ? <p id="err-message" className="text-xs text-red-600">{errors.message}</p>
                  : <span className="text-xs text-slate-500">{values.message.length}/{MAX_MSG}</span>}
              </div>
            </div>

            {/* Drop zone + file input */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`rounded-lg border p-4 ${dragOver ? "border-brand-blue bg-brand-lightblue/10" : "border-slate-200 bg-white"}`}
              title="Drag and drop screenshots here"
            >
              <label className="block text-sm text-slate-700">
                Add screenshots/photos (optional)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onSelectFiles}
                  className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-white file:px-3 file:py-1.5 file:text-sm hover:file:bg-slate-50"
                />
              </label>
              <p className="mt-1 text-xs text-slate-500">Up to {MAX_FILES} images, max {MAX_MB}MB each. You can drag and drop files.</p>

              {files.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {files.map((f, i) => (
                    <div key={i} className="relative rounded-lg border overflow-hidden bg-slate-50">
                      {f.url
                        ? <img src={f.url} alt={`upload ${i + 1}`} className="h-28 w-full object-cover" />
                        : <div className="h-28 w-full grid place-items-center text-xs text-slate-500">Preview</div>}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 rounded bg-white/90 px-2 py-0.5 text-[11px] border hover:bg-white"
                      >
                        Remove
                      </button>
                      {f.error && <div className="p-2 text-[11px] text-red-600">{f.error}</div>}
                    </div>
                  ))}
                </div>
              )}
              {errors.files && <p className="mt-2 text-xs text-red-600">{errors.files}</p>}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="text-xs text-slate-500">
                We’ll never share your details. By submitting, you agree to be contacted about your request.
              </label>

              <Button
                type="submit"
                className="min-w-40 inline-flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {submitting ? "Sending…" : "Request a call"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right column remains the same */}
        <div className="rounded-2xl overflow-hidden border bg-white">
          <div className="aspect-[4/3] md:aspect-[5/4] relative">
            <img
              src="/src/assets/tech-visit.jpg"
              alt="Call-a-Technician on-site visit"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="p-6 md:p-8">
            <h3 className="font-semibold text-brand-navy">Prefer to call?</h3>
            <p className="text-sm text-slate-600 mt-1">Speak with a technician now. Same-day availability across Adelaide.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a href="tel:1300551350" className="rounded-md bg-brand-blue text-white px-4 py-2 text-sm font-semibold hover:bg-brand-navy">Call 1300 551 350</a>
              <a href="mailto:hello@call-a-technician.example" className="rounded-md border px-4 py-2 text-sm font-semibold hover:bg-slate-50">Email us</a>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-brand-lightblue/10 p-3">
                <div className="text-xs text-slate-500">Hours</div>
                <div className="font-medium text-brand-navy">Mon–Sun, 8am–6pm</div>
              </div>
              <div className="rounded-lg bg-brand-lightblue/10 p-3">
                <div className="text-xs text-slate-500">Coverage</div>
                <div className="font-medium text-brand-navy">Adelaide & nearby suburbs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** Helpers */
function getLocalNowForInput() {
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
