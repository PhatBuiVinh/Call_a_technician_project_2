import Section from "../../layout/Section";
import { motion } from "framer-motion";
import SplitRevealText from "../../animation/SplitRevealText";
import Button from "../../atoms/Button";

export default function ServicesHero() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-lightblue/10">
      <div className="absolute inset-0 bg-dot-grid text-brand-navy/15 pointer-events-none" />
      <div className="container-app relative z-10 text-center">
        <motion.div layoutId="shared-page-kicker" className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
        <motion.div layoutId="shared-page-headline">
          <SplitRevealText tag="h1" className="mt-4 text-4xl md:text-6xl font-semibold italic leading-[1.00] text-brand-navy" delay={0.04}>
            On-Site Computer Repair & IT Support
          </SplitRevealText>
        </motion.div>
        <motion.p
          layoutId="shared-page-copy"
          className="mt-2 text-slate-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        >
          Friendly technicians. Same-day availability across Adelaide. Clear pricing and No Fix, No Fee.
        </motion.p>

        <motion.div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="primary" to="/contact">Book a Technician</Button>
          <Button variant="secondary" href="tel:1300551350">Call 1300 551 350</Button>
        </motion.div>
      </div>
    </Section>
  );
}
