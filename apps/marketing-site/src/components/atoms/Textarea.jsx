export default function Textarea({
  label,
  id,
  rows = 4,
  helpText,
  error,
  className = "",
  ...props
}) {
  return (
    <label className="block">
      {label && (
        <span className="block mb-1 text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`block w-full rounded-2xl border border-slate-200/60 px-4 py-3 text-sm placeholder-slate-400 bg-white motion-standard
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue
          ${error ? "border-red-500" : "hover:border-brand-blue/55"} ${className}`}
        {...props}
      />
      {helpText && !error && (
        <span className="mt-1 block text-xs text-slate-500">{helpText}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}
