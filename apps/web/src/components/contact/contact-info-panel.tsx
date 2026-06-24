"use client";

import { motion } from "framer-motion";
import { Check, Clock, MapPin, Mail } from "lucide-react";

const contactTopics = [
  "Student concerns and general questions",
  "Event details and participation inquiries",
  "Announcement clarifications",
  "Collaboration or partnership requests",
  "Technical or website-related concerns",
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

export default function ContactInfoPanel() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="flex flex-col justify-center space-y-6"
    >
      <motion.div variants={fadeUp} className="space-y-4">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Contact / Inquiry
        </span>

        <h2 className="text-balance text-3xl font-display font-black leading-tight text-foreground md:text-4xl lg:text-5xl">
          Get in touch
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            with CICT
          </span>
        </h2>

        <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          Have a question, concern, or request? Reach out to the College of Information
          and Communication Technology for student concerns, event questions, announcement
          clarifications, collaboration requests, or website-related support.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <p className="text-sm font-semibold text-foreground">
          What you can contact us about:
        </p>
        <ul className="space-y-2.5">
          {contactTopics.map((topic) => (
            <li key={topic} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" />
              </span>
              {topic}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="space-y-3 rounded-xl border border-border bg-surface-soft p-5"
      >
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">Office Hours</p>
            <p className="text-xs text-muted-foreground">
              Monday to Friday, 8:00 AM – 5:00 PM
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">Location</p>
            <p className="text-xs text-muted-foreground">
              CICT Office, Taguig City University
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">Response Time</p>
            <p className="text-xs text-muted-foreground">
              We aim to respond within 1–3 working days
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
