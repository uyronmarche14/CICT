"use client";

import { motion } from "framer-motion";
import { ContentBlock } from "@/lib/about-content";

export function TimelineBlock({ block }: { block: Extract<ContentBlock, { type: "timeline" }> }) {
  return (
    <div className="py-4">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="relative space-y-0 max-w-3xl mx-auto"
      >
        {block.items.map((event, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, x: i % 2 === 0 ? -20 : 20 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
            }}
            className="group relative flex items-start gap-5 pl-8 pb-10 last:pb-0"
          >
            <div className="absolute left-0 top-1.5 flex flex-col items-center">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-surface-elevated transition-all duration-300 group-hover:scale-125 group-hover:border-primary" />
              {i < block.items.length - 1 && (
                <div className="mt-1.5 h-[calc(100%+1.5rem)] w-0.5 rounded-full bg-gradient-to-b from-primary/30 to-transparent" />
              )}
            </div>
            <div className="min-w-0 flex-1 rounded-xl transition-colors duration-300">
              <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {event.year}
              </span>
              <h4 className="mt-1 text-base font-bold text-foreground">{event.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
