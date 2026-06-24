"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { ContentBlock } from "@/lib/about-content";

export function QuoteBlock({ block }: { block: Extract<ContentBlock, { type: "quote" }> }) {
  return (
    <div className="py-4">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
        className="mx-auto max-w-3xl rounded-2xl border border-hairline bg-gradient-to-br from-primary/[0.04] via-surface-elevated to-secondary/[0.04] p-8 sm:p-10"
      >
        <Quote className="mb-4 h-8 w-8 text-primary/30" />
        <blockquote>
          <p className="text-lg leading-relaxed text-foreground sm:text-xl">
            &ldquo;{block.text}&rdquo;
          </p>
        </blockquote>
        <div className="mt-6 flex items-center gap-3">
          {block.image && (
            <img
              src={block.image}
              alt={block.author}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
              loading="lazy"
            />
          )}
          <div>
            <p className="text-sm font-bold text-foreground">{block.author}</p>
            <p className="text-xs text-muted-foreground">{block.role}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
