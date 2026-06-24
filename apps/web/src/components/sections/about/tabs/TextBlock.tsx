"use client";

import { motion } from "framer-motion";
import { ContentBlock } from "@/lib/about-content";

export function TextBlock({ block }: { block: Extract<ContentBlock, { type: "text" }> }) {
  if (block.image) {
    const textCol = (
      <div className="flex flex-col justify-center">
        {block.title && (
          <h3 className="mb-3 text-lg font-bold text-foreground sm:text-xl">{block.title}</h3>
        )}
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {block.content}
        </p>
      </div>
    );

    const imgCol = (
      <div className="overflow-hidden rounded-2xl border border-hairline bg-muted/30 shadow-sm">
        <img
          src={block.image}
          alt={block.title ?? ""}
          className="h-72 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-80 lg:h-96"
          loading="lazy"
        />
      </div>
    );

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
            className={`grid items-center gap-6 md:gap-10 ${
              block.image
                ? block.imageRight
                  ? "grid-cols-1 md:grid-cols-[1fr_1fr]"
                  : "grid-cols-1 md:grid-cols-[1fr_1fr]"
                : "grid-cols-1"
            }`}
        >
          {block.imageRight ? (
            <>
              {textCol}
              {imgCol}
            </>
          ) : (
            <>
              {imgCol}
              {textCol}
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
        className="max-w-3xl"
      >
        {block.title && (
          <div className="mb-3">
            <h3 className="text-lg font-bold text-foreground sm:text-xl">{block.title}</h3>
          </div>
        )}
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {block.content}
        </p>
      </motion.div>
    </div>
  );
}
