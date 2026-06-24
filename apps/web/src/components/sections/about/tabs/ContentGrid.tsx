"use client";

import { motion } from "framer-motion";
import { ContentBlock } from "@/lib/about-content";

export function ContentGrid({ block }: { block: Extract<ContentBlock, { type: "grid" }> }) {
  return (
    <div className="py-4">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        className={`grid gap-4 sm:gap-5 ${
          block.columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : block.columns === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {block.items.map((item, i) => {
          const Icon = item.icon;
          const accentGradient = item.accent ?? "from-primary to-secondary";
          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface-elevated p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100`}
              />
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
