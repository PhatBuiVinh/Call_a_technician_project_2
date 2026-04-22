import Section from "../../layout/Section";
import NeedHelpBand from "../../UI/NeedHelpBand";

export default function CTABand() {
  return (
    <Section>
      <div className="container-app">
        <NeedHelpBand
          title="Need help today?"
          description="Book a technician — we’ll get you back on track quickly."
          primaryLabel="Contact Us"
          primaryTo="/contact"
          secondaryLabel="Service Areas"
          secondaryTo="/location"
          secondaryHref={undefined}
        />
      </div>
    </Section>
  );
}
