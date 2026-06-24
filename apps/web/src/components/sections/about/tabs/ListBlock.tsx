"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ContentBlock } from "@/lib/about-content";

export function ListBlock({ block }: { block: Extract<ContentBlock, { type: "list" }> }) {
  return (
    <div className="py-2">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {block.title && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="mb-5"
          >
            <h3 className="text-lg font-bold text-foreground sm:text-xl">{block.title}</h3>
            <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
          </motion.div>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {block.items.map((item, i) => {
            const Icon = item.icon ?? Check;
            return (
              <motion.li
                key={i}
                variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                className="group flex items-start gap-3 rounded-xl border border-hairline bg-surface-elevated p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
