import { Link } from 'react-router-dom';

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  to,
  href,
  ...props
}) {
  const base =
    "inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-sm font-semibold tracking-[0.16px] shadow-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    primary: "rounded-[56px] bg-brand-green text-brand-navy motion-safe:hover:brightness-95 motion-safe:hover:-translate-y-[1px] motion-safe:hover:scale-[1.02] focus-visible:ring-brand-lightblue/70",
    secondary: "rounded-[56px] border border-brand-blue/45 text-brand-blue bg-white motion-safe:hover:bg-brand-lightblue/20 motion-safe:hover:border-brand-blue motion-safe:hover:scale-[1.02] focus-visible:ring-brand-lightblue/70",
    accent: "rounded-[56px] bg-brand-blue text-white motion-safe:hover:bg-brand-navy motion-safe:hover:-translate-y-[1px] motion-safe:hover:scale-[1.02] focus-visible:ring-brand-lightblue/70",
    ghost: "rounded-[56px] text-brand-blue shadow-none motion-safe:hover:bg-brand-lightblue/20 motion-safe:hover:scale-[1.02] focus-visible:ring-brand-lightblue/70",
  };

  const classNames = `${base} ${styles[variant] || styles.primary} ${className}`.trim();

  // If 'to' prop is provided, render as Link for internal navigation
  if (to) {
    return (
      <Link to={to} className={classNames} {...props}>
        {children}
      </Link>
    );
  }

  // If 'href' prop is provided, render as anchor tag
  if (href) {
    return (
      <a href={href} className={classNames} {...props}>
        {children}
      </a>
    );
  }

  // Default: render as button
  return (
    <button type={type} className={classNames} {...props}>
      {children}
    </button>
  );
}