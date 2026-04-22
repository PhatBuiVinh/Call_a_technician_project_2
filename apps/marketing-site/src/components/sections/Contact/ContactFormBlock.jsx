import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ShieldCheck, Clock3 } from "lucide-react";
import Section from "../../layout/Section";
import Input from "../../atoms/Input";
import Textarea from "../../atoms/Textarea";
import Button from "../../atoms/Button";
import { portal } from "../../../lib/portal"; // NEW: API helper import
import { getRecaptchaToken } from "../../../lib/recaptcha";
import techVisitImg from "../../../assets/tech-visit.jpg";

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
  const STEPS = [
    { id: 1, title: "Contact" },
    { id: 2, title: "Issue" },
    { id: 3, title: "Review" },
  ];

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
  const [activeStep, setActiveStep] = useState(1);

  // Anti-spam: track form load time (3 second minimum)
  const formLoadTime = useRef(Date.now());

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
  const fileZoneRef = useRef(null);

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

  // Convert files to base64 for submission
  const convertFilesToBase64 = async (fileList) => {
    const base64Images = [];
    
    for (const fileObj of fileList) {
      if (fileObj.error) continue; // Skip files with errors
      
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(fileObj.file);
        });
        
        base64Images.push(base64);
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }
    
    return base64Images;
  }
  function removeFile(idx) {
    setFiles((arr) => {
      const copy = [...arr];
      const [removed] = copy.splice(idx, 1);
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  const STEP_FIELDS = {
    1: ["name", "phone", "email"],
    2: ["preferredAt", "message"],
    3: ["files"],
  };

  function markStepTouched(step) {
    const fields = STEP_FIELDS[step] || [];
    const patch = {};
    for (const field of fields) {
      patch[field] = true;
    }
    if (Object.keys(patch).length) {
      setTouched((t) => ({ ...t, ...patch }));
    }
  }

  function stepHasErrors(step) {
    const fields = STEP_FIELDS[step] || [];
    return fields.some((field) => {
      if (field === "files") return Boolean(errors.files);
      return Boolean(errors[field]);
    });
  }

  function onNextStep() {
    markStepTouched(activeStep);
    if (stepHasErrors(activeStep)) {
      focusFirstError(STEP_FIELDS[activeStep]);
      return;
    }
    setActiveStep((s) => Math.min(3, s + 1));
  }

  function onPrevStep() {
    setActiveStep((s) => Math.max(1, s - 1));
  }

  // SUBMIT: replaced to call Portal API (no more fake demo delay)
  async function onSubmit(e) {
    e.preventDefault();

    if (activeStep < 3) {
      onNextStep();
      return;
    }

    // Reveal validation errors and move focus to the first problem field.
    setTouched((t) => ({
      ...t,
      name: true,
      phone: true,
      email: true,
      message: true,
      preferredAt: true,
    }));

    if (hasErrors) {
      focusFirstError();
      return;
    }

    setSubmitting(true);
    setServerError("");

    // Anti-spam: 3 second minimum form fill time
    const timeSinceLoad = Date.now() - formLoadTime.current;
    if (timeSinceLoad < 3000) {
      setSubmitting(false);
      setServerError("Please take a moment to fill out the form properly.");
      return;
    }

    // Anti-spam: reCAPTCHA v3 verification
    const recaptchaToken = await getRecaptchaToken('submit_job_request');

    try {
      // Basic validation
      if (!values.name?.trim() || !values.phone?.trim()) {
        throw new Error("Name and phone are required.");
      }

      // Convert uploaded images to base64
      const base64Images = await convertFilesToBase64(files);

      // Build description
      const descriptionParts = [
        values.message?.trim(),
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
        images: base64Images, // Now includes converted base64 images
        recaptchaToken, // Anti-spam: reCAPTCHA v3 token
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
      setActiveStep(1);
      localStorage.removeItem(DRAFT_KEY);

    } catch (err) {
      setSubmitting(false);
      setServerError(err?.message || "Failed to submit. Please try again.");
    }
  }

  function focusFirstError(preferredFields = null) {
    const order = [
      ["name", refs.name],
      ["phone", refs.phone],
      ["email", refs.email],
      ["preferredAt", refs.preferredAt],
      ["message", refs.message],
    ];

    const filteredOrder = Array.isArray(preferredFields)
      ? order.filter(([key]) => preferredFields.includes(key))
      : order;

    for (const [key, ref] of filteredOrder) {
      if (!errors[key]) continue;
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const target = ref.current?.querySelector("input, textarea");
      target?.focus();
      return;
    }

    if (errors.files && (!Array.isArray(preferredFields) || preferredFields.includes("files"))) {
      fileZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const fileInput = fileZoneRef.current?.querySelector("input[type='file']");
      fileInput?.focus();
    }
  }

  return (
    <Section>
      <div className="container-app grid lg:grid-cols-2 gap-8 items-start">
        {/* Form card */}
        <div className="card-spotlight p-6 md:p-8">
          <h2 className="h2">Tell us a bit about the issue</h2>
          <p className="text-sm text-slate-600 mt-2">
            We’ll get back to you within business hours (usually sooner).
          </p>

          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-brand-blue" />
              Quick response
            </div>
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" />
              Private and secure
            </div>
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-blue" />
              No Fix, No Fee
            </div>
          </div>

          {/* Success banner (now real, not demo) */}
          {success && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status" aria-live="polite">
              Thanks! Your request was submitted. We’ll contact you shortly.
              {jobRef ? <div className="mt-1 text-emerald-700">{jobRef}</div> : null}
            </div>
          )}
          {serverError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
            {/* Honeypot */}
            <div className="hidden">
              <label>
                If you are a human, leave this field empty
                <input type="text" name="website" value={values.website} onChange={onChange("website")} tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="rounded-xl border border-brand-blue/20 bg-white/75 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                <span>Step {activeStep} of 3</span>
                <span>{STEPS.find((s) => s.id === activeStep)?.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {STEPS.map((step) => {
                  const isActive = activeStep === step.id;
                  const isDone = activeStep > step.id;
                  return (
                    <div
                      key={step.id}
                      className={`rounded-md px-2 py-1.5 text-center text-xs font-medium motion-standard ${
                        isActive
                          ? "bg-brand-blue text-white"
                          : isDone
                            ? "bg-brand-lightblue/25 text-brand-blue"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {step.title}
                    </div>
                  );
                })}
              </div>
            </div>

            {activeStep === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div ref={refs.name}>
                    <Input
                      label="Full name"
                      placeholder="Your name"
                      autoComplete="name"
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
                      autoComplete="tel"
                      inputMode="tel"
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
                    autoComplete="email"
                    value={values.email}
                    onChange={onChange("email")}
                    aria-invalid={!!(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? "err-email" : undefined}
                  />
                  {touched.email && errors.email && <p id="err-email" className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </>
            )}

            {activeStep === 2 && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700">
                      Suburb
                      <input
                        list="sa-suburbs"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue hover:border-slate-400"
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

                <div ref={refs.preferredAt}>
                  <label className="block text-sm text-slate-700">
                    Preferred date & time (optional)
                    <input
                      type="datetime-local"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue hover:border-slate-400"
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
              </>
            )}

            {activeStep === 3 && (
              <>
                <div className="rounded-lg border border-brand-blue/20 bg-brand-lightblue/10 p-3 text-sm text-slate-700">
                  Quick review: we will contact <span className="font-medium">{values.name || "you"}</span> on <span className="font-medium">{values.phone || "your phone"}</span>.
                </div>

                <div
                  ref={fileZoneRef}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`rounded-lg border p-4 motion-standard ${dragOver ? "border-brand-blue bg-brand-lightblue/10" : "border-slate-200 bg-white"}`}
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
              </>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="text-xs text-slate-500 max-w-[70%]">
                {activeStep < 3
                  ? "Takes under 60 seconds. You can review before final submit."
                  : "We’ll never share your details. By submitting, you agree to be contacted about your request."}
              </div>

              <div className="flex items-center gap-2">
                {activeStep > 1 && (
                  <Button type="button" variant="secondary" onClick={onPrevStep}>Back</Button>
                )}

                {activeStep < 3 ? (
                  <Button type="button" onClick={onNextStep}>Continue</Button>
                ) : (
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
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right column remains the same */}
        <div className="card overflow-hidden">
          <div className="aspect-[4/3] md:aspect-[5/4] relative">
            <img
              src={techVisitImg}
              alt="Call-a-Technician on-site visit"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="p-6 md:p-8">
            <h3 className="font-semibold text-brand-navy">Prefer to call?</h3>
            <p className="text-sm text-slate-600 mt-1">Speak with a technician now. Same-day availability across Adelaide.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button href="tel:1300551350" variant="accent">Call 1300 551 350</Button>
              <Button href="mailto:hello@call-a-technician.example" variant="secondary">Email us</Button>
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
