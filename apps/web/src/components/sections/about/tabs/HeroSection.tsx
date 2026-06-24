"use client";

import { motion } from "framer-motion";
import { ContentBlock } from "@/lib/about-content";
import { ArrowDown } from "lucide-react";

export function HeroIntro({ block }: { block: Extract<ContentBlock, { type: "heroIntro" }> }) {
  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <div
          className="h-full w-full object-cover"
          style={{
            backgroundImage: `url(${block.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      </div>
      <div className="relative flex min-h-[52vh] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-16 pb-20 md:min-h-[62vh] lg:min-h-[70vh]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl"
        >
          {block.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/80"
        >
          {block.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8"
        >
          <ArrowDown className="w-6 h-6 text-white/40 animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
}
