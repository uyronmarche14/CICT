"use client";

import { motion } from "framer-motion";
import MeshGradientBg from "@/components/ripplebg";

export function AboutHero() {
  return (
    <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-gradient-to-b from-primary/20 via-primary/8 via-secondary/5 to-background pt-28 lg:pt-32">
      <MeshGradientBg variant="vibrant" interactive={false} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center font-display font-black text-white tracking-wide text-2xl sm:text-3xl md:text-4xl"
        >
          Pagbati!
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-2 text-center font-display font-black text-primary leading-[0.85] tracking-normal text-5xl sm:text-7xl md:text-[8rem] lg:text-[11rem]"
          style={{
            textShadow:
              "0 2px 0 #5A22D4, 0 4px 0 #4A1BB5, 0 6px 0 #3A1496, 0 8px 0 #2A0D78, 0 10px 10px rgba(0,0,0,0.25)",
          }}
        >
          ABOUT
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4"
        >
          <h2 className="text-center font-display font-black text-foreground leading-[0.85] text-4xl sm:text-6xl md:text-[6rem] lg:text-[9rem]">
            CICT
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Discover who we are, what we stand for, and how we&apos;re shaping the next generation
          of technology leaders in Taguig.
        </motion.p>
      </div>
    </section>
  );
}
