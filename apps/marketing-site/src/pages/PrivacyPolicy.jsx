import { Link } from "react-router-dom";
import Section from "../components/layout/Section";
import Button from "../components/atoms/Button";

export default function PrivacyPolicy() {
  return (
    <div className="text-slate-800">
      <Section>
        <div className="container-app max-w-3xl">
          <h1 className="text-3xl font-semibold text-brand-navy">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: May 2025</p>
          <p className="mt-4 text-sm text-slate-700 leading-relaxed">
            Call-a-Technician is committed to protecting your personal information in accordance with the
            <strong> Australian Privacy Act 1988</strong> and the Australian Privacy Principles (APPs).
            This policy explains what personal information we collect, how we use it, and your rights regarding that information.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed">

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">1. Who We Are</h2>
              <p className="mt-3 text-slate-700">
                Call-a-Technician is an onsite IT support and consulting service based in Adelaide, South Australia.
                We operate at <strong>callatechnician.com.au</strong> and can be contacted at:
              </p>
              <ul className="mt-2 list-none text-slate-700 space-y-1">
                <li>Email: <a href="mailto:support@callatech.com" className="text-brand-blue hover:underline">support@callatech.com</a></li>
                <li>Phone: <a href="tel:1300551350" className="text-brand-blue hover:underline">1300 551 350</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">2. Information We Collect</h2>
              <p className="mt-3 text-slate-700">
                We collect personal information that you provide directly to us. This includes:
              </p>
              <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
                <li><strong>First name and last name</strong> — to address you and record your service enquiry</li>
                <li><strong>Phone number</strong> — to contact you regarding your booking or enquiry</li>
                <li><strong>Email address</strong> — to send confirmation and follow-up communications</li>
                <li><strong>Suburb</strong> — to confirm service availability in your area</li>
                <li><strong>Enquiry details</strong> — a description of the IT issue or service you require</li>
              </ul>
              <p className="mt-3 text-slate-700">
                We do <strong>not</strong> collect payment card details, government identifiers, or sensitive personal information through this website.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">3. How We Collect Information</h2>
              <p className="mt-3 text-slate-700">
                We collect information when you:
              </p>
              <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
                <li>Submit an enquiry through our contact form</li>
                <li>Call us directly on 1300 551 350</li>
                <li>Email us directly</li>
              </ul>
              <p className="mt-3 text-slate-700">
                Contact form submissions are sent to our Call-a-Technician booking API so the team can review your enquiry and manage it in the admin workflow.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">4. How We Use Your Information</h2>
              <p className="mt-3 text-slate-700">We use your personal information to:</p>
              <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
                <li>Respond to your enquiry and arrange a service visit</li>
                <li>Confirm bookings and communicate appointment details</li>
                <li>Follow up on completed service visits if required</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">5. Disclosure of Information</h2>
              <p className="mt-3 text-slate-700">
                We do not disclose your personal information to third parties except:
              </p>
              <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
                <li>Where required or authorised by law;</li>
                <li>To service providers strictly when needed to deliver our services to you; or</li>
                <li>With your explicit consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">6. Third-Party Tools on This Website</h2>
              <p className="mt-3 text-slate-700">
                This website embeds third-party tools including the <strong>Kaspersky Cyberthreat Real-Time Map</strong> (displayed on our Consulting page). This tool is operated by Kaspersky and is displayed for informational purposes only. When you view this embedded content, Kaspersky may collect data in accordance with their own privacy policy. Call-a-Technician does not control or receive data from this tool.
              </p>
              <p className="mt-2 text-slate-700">
                We are not responsible for the privacy practices of any third-party tools or websites linked from this website. We encourage you to review the privacy policies of any third-party services you interact with.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">7. Data Security</h2>
              <p className="mt-3 text-slate-700">
                We take reasonable steps to protect your personal information from misuse, loss, unauthorised access, modification, or disclosure. Enquiry data submitted via our contact form is transmitted using industry-standard HTTPS encryption.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">8. Data Retention</h2>
              <p className="mt-3 text-slate-700">
                We retain personal information only for as long as necessary to fulfil the purpose for which it was collected, or as required by law. You may request deletion of your personal information at any time by contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">9. Cookies &amp; Analytics</h2>
              <p className="mt-3 text-slate-700">
                This website may use cookies or similar technologies for basic functionality and analytics. We do not use cookies to track personal information or serve targeted advertising. You can disable cookies in your browser settings, though some website features may not function correctly as a result.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">10. Your Rights</h2>
              <p className="mt-3 text-slate-700">
                Under the Australian Privacy Act 1988, you have the right to:
              </p>
              <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
                <li>Access the personal information we hold about you;</li>
                <li>Request correction of any inaccurate or out-of-date information;</li>
                <li>Request deletion of your personal information (subject to legal obligations); and</li>
                <li>Make a complaint about how we have handled your personal information.</li>
              </ul>
              <p className="mt-3 text-slate-700">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:support@callatech.com" className="text-brand-blue hover:underline">support@callatech.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">11. Changes to This Policy</h2>
              <p className="mt-3 text-slate-700">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this policy periodically.
              </p>
            </section>

            <div className="rounded-xl bg-slate-50 border p-5 mt-8">
              <p className="text-xs text-slate-500">
                Questions about this policy? Contact us at{" "}
                <a href="mailto:support@callatech.com" className="text-brand-blue hover:underline">support@callatech.com</a>
                {" "}or call{" "}
                <a href="tel:1300551350" className="text-brand-blue hover:underline">1300 551 350</a>.
                See also our{" "}
                <Link to="/terms" className="text-brand-blue hover:underline">Terms &amp; Conditions</Link>.
              </p>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row gap-3">
            <Button variant="primary" to="/contact">Get in Touch</Button>
            <Button variant="secondary" to="/">Back to Home</Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
