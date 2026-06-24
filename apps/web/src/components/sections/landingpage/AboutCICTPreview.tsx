"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Lightbulb, Users, Zap } from "lucide-react";

export default function AboutCICTPreview() {
  return (
    <section className="relative bg-canvas py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
          className="text-center"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
          >
            About CICT
          </motion.span>

          <motion.h2
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
            className="mt-4 text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-3xl font-black leading-tight text-transparent sm:text-4xl md:text-5xl"
          >
            Shaping Future-Ready Technology Leaders
          </motion.h2>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
            className="mt-4 mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            The College of Information and Communication Technology empowers Taguig&apos;s
            youth through industry-aligned programs, coding bootcamps, innovation labs, and
            a vibrant student community.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Discover CICT
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/organizations"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-elevated px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary/30 hover:text-primary hover:shadow-sm"
            >
              <Users className="h-4 w-4" />
              Explore Organizations
            </Link>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { icon: GraduationCap, label: "Academics", href: "/about" },
              { icon: Lightbulb, label: "Innovation", href: "/about" },
              { icon: Users, label: "Campus Life", href: "/about" },
              { icon: Zap, label: "Organizations", href: "/about" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-hairline bg-surface-elevated p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
