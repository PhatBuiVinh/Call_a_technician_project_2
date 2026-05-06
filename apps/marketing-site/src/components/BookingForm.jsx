import Button from "./atoms/Button";

export default function BookingForm() {
  return (
    <div className="grid max-w-md gap-4 rounded-[40px] border border-slate-200/60 bg-white p-6 md:p-8">
      <h2 className="text-xl font-semibold text-brand-navy">Request support</h2>
      <p className="text-sm text-slate-600">
        The booking flow is not exposed yet. Use the contact page to request a technician.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="primary" className="w-full justify-center py-3" to="/contact">
          Contact Us
        </Button>
        <Button type="button" variant="secondary" className="w-full justify-center py-3" href="tel:1300551350">
          Call Now
        </Button>
      </div>
    </div>
  );
}
