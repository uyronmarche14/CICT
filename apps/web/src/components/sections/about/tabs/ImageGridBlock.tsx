"use client";

import { motion } from "framer-motion";
import { ContentBlock } from "@/lib/about-content";

export function ImageGridBlock({ block }: { block: Extract<ContentBlock, { type: "imageGrid" }> }) {
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
        className="grid grid-cols-2 gap-3 sm:gap-4"
      >
        {block.images.map((img, i) => (
          <motion.figure
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
            }}
            className="group overflow-hidden rounded-2xl border border-hairline bg-muted/30 shadow-sm"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-80 lg:h-96"
              loading="lazy"
            />
            {img.caption && (
              <figcaption className="px-3 py-2 text-center text-xs text-muted-foreground">
                {img.caption}
              </figcaption>
            )}
          </motion.figure>
        ))}
      </motion.div>
    </div>
  );
}
