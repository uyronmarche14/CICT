"use client";

import { motion } from "framer-motion";
import ContactInfoPanel from "./contact-info-panel";
import ContactForm from "./contact-form";

const sectionVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
} as const;

const panelVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export default function ContactSection() {
  return (
    <section id="contact" className="bg-background py-20 text-foreground md:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariant}
        className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:px-8 lg:gap-16"
      >
        <motion.div variants={panelVariant}>
          <ContactInfoPanel />
        </motion.div>
        <motion.div variants={panelVariant}>
          <ContactForm />
        </motion.div>
      </motion.div>
    </section>
  );
}
