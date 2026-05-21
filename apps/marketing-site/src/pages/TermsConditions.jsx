import { Link } from "react-router-dom";
import Section from "../components/layout/Section";

export default function TermsConditions() {
  return (
    <div className="text-slate-800">
      <Section>
        <div className="container-app max-w-3xl">
          <h1 className="text-3xl font-semibold text-brand-navy">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: May 2025</p>
          <p className="mt-4 text-sm text-slate-700 leading-relaxed">
            The purchase of goods and services from Call-a-Technician is subject to the following terms and conditions.
            By booking or receiving goods or services from Call-a-Technician, you accept these terms and conditions in full.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed">

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">Mandatory Repair Notices</h2>
              <ul className="mt-3 list-disc list-inside text-slate-700 space-y-2">
                <li>Goods presented for repair may be replaced by refurbished goods of the same type rather than being repaired. Refurbished parts may be used to repair the goods.</li>
                <li>The repair of your goods may result in the loss of any user-generated data. Please ensure you have made a backup copy of any data saved on your equipment before the technician arrives.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">1. Services</h2>
              <p className="mt-3 text-slate-700">
                Any period or date for delivery of goods or provision of services stated by Call-a-Technician is an estimate only.
                We will use our best endeavours to meet any estimated dates and will provide as much notice as possible of any expected delays.
              </p>
              <p className="mt-2 text-slate-700">
                You acknowledge and agree that we may need to take your system to our base or third-party premises for diagnosis and repair where onsite resolution is not possible.
                We will exercise all due care while in possession of your equipment to ensure no loss or damage occurs.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">2. Quotations</h2>
              <p className="mt-3 text-slate-700">
                Any verbal quote given by Call-a-Technician is given as a guide based on the limited information provided by the customer. A verbal quote is an estimate only and is not a guarantee that the service will be provided at that price.
              </p>
              <p className="mt-2 text-slate-700">
                Any written quote given by Call-a-Technician is a guarantee that the product or service will be provided at that price. Written quotes are valid for 7 days from the date of issue.
              </p>
              <p className="mt-2 text-slate-700">
                Any pricing stated on our website or advertising material is valid at the time of publication and may be subject to change at the discretion of Call-a-Technician.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">3. Warranty</h2>
              <p className="mt-3 text-slate-700">
                Call-a-Technician offers a <strong>30-day warranty</strong> on all computer repair services, excluding software problems and issues deemed to have been caused by a third party.
              </p>
              <ul className="mt-2 list-disc list-inside text-slate-700 space-y-2">
                <li>If any software is changed (by you or via an automatic update) after our work is completed, any issues arising from that change will not be covered under warranty.</li>
                <li>Any fault deemed to have resurfaced as a result of misuse by the user will not be covered by this warranty. Call-a-Technician will determine whether an issue has not been resolved correctly or has resurfaced due to misuse.</li>
                <li>A 12-month warranty applies to all new hardware sold by Call-a-Technician, with a 3-month onsite labour warranty (unless otherwise stated).</li>
                <li>If a technician attends a premises for a warranty call and the fault is not related to the original repair or hardware, the customer will be charged the applicable rate for that separate issue.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">4. Liability</h2>
              <p className="mt-3 text-slate-700">
                Call-a-Technician will exercise reasonable care in handling any equipment you provide to us.
              </p>
              <p className="mt-2 text-slate-700">
                You agree to indemnify and keep Call-a-Technician indemnified against any claim, demand, injury, damage, loss, expense, cost or liability (whether direct or indirect) made against or suffered by Call-a-Technician in connection with your equipment, your breach of these Terms and Conditions, or your breach of any rights of third parties.
              </p>
              <p className="mt-2 text-slate-700">
                Where Call-a-Technician is liable to you under the Australian Consumer Law, to the fullest extent permitted by law, our liability shall be limited to:
              </p>
              <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
                <li>In relation to goods: replacement, equivalent supply, or a refund of the amount paid; and</li>
                <li>In relation to services: re-supply of the services, or payment of the cost of having the services supplied again.</li>
              </ul>
              <p className="mt-2 text-slate-700">
                Call-a-Technician will not be liable for any accidental, consequential or indirect damages arising from the provision of services, including but not limited to: damage to hardware, corruption of software, data loss, downtime, interruption of business services, loss of profit, or damage to goodwill.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">5. Payment</h2>
              <ul className="mt-3 list-disc list-inside text-slate-700 space-y-2">
                <li>Payment for goods or services must be made by cash, direct deposit, or credit card upon completion of work, or at the time requested by Call-a-Technician. No credit terms are provided without prior management approval.</li>
                <li>Services charged at an hourly rate carry a minimum charge of 1 hour labour.</li>
                <li>All goods supplied by Call-a-Technician are charged separately from labour services.</li>
                <li>All visits are chargeable unless Call-a-Technician is unable to diagnose or suggest a solution to the customer's problem.</li>
                <li>Call-a-Technician may vary its pricing for goods and services without prior notice to the customer.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">6. Cancellation Policy</h2>
              <p className="mt-3 text-slate-700">
                All services are subject to our cancellation policy. If you give us less than <strong>24 hours' notice</strong> to cancel any request for onsite service, a cancellation fee equal to the first hour of service at the rate quoted at the time of booking will apply. All telephone bookings are recorded to confirm your consent of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">7. Customer Responsibilities</h2>
              <ul className="mt-3 list-disc list-inside text-slate-700 space-y-2">
                <li>You represent and warrant that you are the owner of, and/or have the right to authorise Call-a-Technician to carry out repairs on, all equipment provided.</li>
                <li>You must back up all software, data and files stored on your computer prior to the technician's arrival. Call-a-Technician will not be responsible for any loss, alteration or corruption of data during a service visit.</li>
                <li>You warrant that you hold all necessary licences and approvals for any software you request Call-a-Technician to install. You agree to indemnify us against any claim arising directly or indirectly from installing software at your request.</li>
                <li>A person of at least 18 years of age must be present for the duration of any onsite service.</li>
                <li>You must provide our technicians with: access to the relevant areas of your premises; necessary passwords; a safe working environment; and electrical power and internet access where applicable.</li>
                <li>Where services involve software installation, you must provide installation media and valid product keys.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">8. No Fix, No Fee</h2>
              <p className="mt-3 text-slate-700">
                If Call-a-Technician is unable to diagnose the cause of a software or hardware problem, nor suggest a suitable resolution, no charge will apply to the customer.
              </p>
              <p className="mt-2 text-slate-700">
                The No Fix, No Fee guarantee applies only where Call-a-Technician is genuinely unable to diagnose or suggest a solution. Call-a-Technician retains sole discretion in determining whether a service qualifies as No Fix, No Fee.
              </p>
              <p className="mt-2 text-slate-700">
                If a technician has the skill to resolve an issue and the customer chooses not to proceed with the recommended solution, the minimum charge (1 hour labour) is payable for the diagnosis.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">9. Same-Day Service</h2>
              <p className="mt-3 text-slate-700">
                All requests for same-day service are honoured on a best-effort basis and may not always be possible due to technician availability, illness, or periods of leave. Call-a-Technician apologises in advance if same-day service cannot be provided on a given occasion. We do not guarantee that all necessary work can be completed at the initial appointment.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">10. Third-Party Tools &amp; Content</h2>
              <p className="mt-3 text-slate-700">
                Our website may embed or link to third-party tools, maps, and services (including, but not limited to, the Kaspersky Cyberthreat Real-Time Map). These tools are provided by independent third parties and are displayed for informational purposes only.
              </p>
              <p className="mt-2 text-slate-700">
                Call-a-Technician does not own, operate, or control any third-party tools displayed on this website. We make no representations or warranties regarding the accuracy, availability, or content of any third-party service. Your use of any third-party content or service is subject to that provider's own terms of use and privacy policy.
              </p>
              <p className="mt-2 text-slate-700">
                Call-a-Technician accepts no liability for any loss or damage arising from your reliance on, or interaction with, any third-party tool or content embedded on or linked from this website.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">11. Feedback</h2>
              <p className="mt-3 text-slate-700">
                You agree that we may use any written feedback you provide to us on our website and in other marketing materials without requiring your further consent.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-navy uppercase tracking-wide">12. Governing Law</h2>
              <p className="mt-3 text-slate-700">
                These Terms and Conditions are governed by the laws of South Australia, Australia. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of South Australia.
              </p>
            </section>

            <div className="rounded-xl bg-slate-50 border p-5 mt-8">
              <p className="text-xs text-slate-500">
                For questions about these terms, contact us at{" "}
                <a href="mailto:support@callatech.com" className="text-brand-blue hover:underline">support@callatech.com</a>
                {" "}or call{" "}
                <a href="tel:1300551350" className="text-brand-blue hover:underline">1300 551 350</a>.
                See also our{" "}
                <Link to="/privacy-policy" className="text-brand-blue hover:underline">Privacy Policy</Link>.
              </p>
            </div>

          </div>
        </div>
      </Section>
    </div>
  );
}
