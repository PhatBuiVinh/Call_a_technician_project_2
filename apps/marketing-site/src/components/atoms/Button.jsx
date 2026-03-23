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
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
  primary: "bg-brand-green text-brand-navy hover:brightness-95 focus:ring-brand-lightblue",
  secondary: "border border-brand-green text-brand-green hover:bg-brand-green hover:text-brand-navy focus:ring-brand-lightblue",
  accent: "bg-brand-blue text-white hover:brightness-95 focus:ring-brand-lightblue",
  ghost: "text-brand-blue hover:bg-brand-lightblue/20 focus:ring-brand-lightblue",
};

  const buttonContent = (
    <button
      type={type}
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  // If 'to' prop is provided, render as Link for internal navigation
  if (to) {
    return (
      <Link to={to} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  // If 'href' prop is provided, render as anchor tag
  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    );
  }

  // Default: render as button
  return buttonContent;
}