import Button from "../components/atoms/Button";

export default function Login() {
  const portalUrl = import.meta.env.VITE_PORTAL_URL || "/contact";

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Customer login is handled in the admin portal</h1>
      <p className="mt-4 text-slate-600">
        There is no public customer sign-in on this site. If you need portal access, use the admin portal or contact the team.
      </p>
      <div className="mt-6 flex gap-3 flex-col sm:flex-row">
        <Button href={portalUrl} className="w-full">
          Open Admin Portal
        </Button>
        <Button to="/contact" variant="secondary" className="w-full">
          Request Help
        </Button>
      </div>
    </div>
  );
}
