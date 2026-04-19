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
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    primary: "bg-brand-green text-brand-navy hover:brightness-95 hover:-translate-y-[1px] focus-visible:ring-brand-lightblue/70",
    secondary: "border border-brand-blue/45 text-brand-blue bg-white hover:bg-brand-lightblue/20 hover:border-brand-blue focus-visible:ring-brand-lightblue/70",
    accent: "bg-brand-blue text-white hover:bg-brand-navy hover:-translate-y-[1px] focus-visible:ring-brand-lightblue/70",
    ghost: "text-brand-blue shadow-none hover:bg-brand-lightblue/20 focus-visible:ring-brand-lightblue/70",
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