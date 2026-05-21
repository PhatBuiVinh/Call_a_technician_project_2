export default function Section({ muted = false, size = "md", className = "", children }) {
  const spacingClass = size === "sm" ? "section-tight" : size === "lg" ? "section-feature" : "section";

  return (
    <section className={`${muted ? "section-muted" : ""}`}>
      <div className={`${spacingClass} container-app ${className}`}>{children}</div>
    </section>
  );
}
