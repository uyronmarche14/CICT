"use client";

import { motion } from "framer-motion";
import { ContentBlock } from "@/lib/about-content";

export function StatsGrid({ block }: { block: Extract<ContentBlock, { type: "stats" }> }) {
  return (
    <div className="py-5">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {block.items.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
                }}
                className="group relative flex flex-col items-center rounded-2xl border border-hairline bg-surface-elevated px-4 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-black text-foreground sm:text-3xl" style={{ fontFamily: "Blockletter, Inter, sans-serif" }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
