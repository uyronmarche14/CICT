"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { ClientOnly } from "@/components/client-only";
import MeshGradientBg from "@/components/ripplebg";

const HeroSection = () => {
  // Animation variants
  const animations = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.2,
          duration: 0.6,
        },
      },
    },
    fadeUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { duration: 1.2 } },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.85 },
      visible: { opacity: 1, scale: 1, transition: { duration: 1.4 } },
    },
    slideLeft: {
      hidden: { opacity: 0, x: -80 },
      visible: { opacity: 1, x: 0, transition: { duration: 1.1 } },
    },
    slideRight: {
      hidden: { opacity: 0, x: 80 },
      visible: { opacity: 1, x: 0, transition: { duration: 1.1 } },
    },
    scrollDown: {
      hidden: { opacity: 0, y: 30, scale: 0.9 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 1.3, delay: 0.8 },
      },
    },
    bounce: {
      animate: {
        y: [0, 12, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 2.0, repeat: Infinity },
      },
    },
  };

  // Static fallback content (rendered on server)
  const StaticContent = () => (
    <section className="relative min-h-screen flex items-center justify-center">
      <MeshGradientBg variant="default" interactive={false} />
      <div className="relative z-10 w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center text-center">
            <h1 className="font-black text-foreground text-center w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-4 select-none" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1), -1px -1px 0 rgba(255,255,255,0.1)' }}>
              PAGBATI!
            </h1>
            <h1 className="text-center font-black text-primary leading-[0.8] mb-2 md:mb-4 tracking-tighter w-full text-4xl sm:text-6xl md:text-8xl lg:text-9xl cursor-pointer select-none" style={{ WebkitTextStroke: '2px currentColor', textShadow: '3px 3px 0 rgba(0,0,0,0.2), -2px -2px 0 rgba(255,255,255,0.1)' }}>
              TECHNEKSCHOLAR
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-2 mb-4 md:mb-6">
              <h1 className="text-center font-black text-foreground font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl select-none" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1), -1px -1px 0 rgba(255,255,255,0.1)' }}>
                NG
              </h1>
              <h1 className="text-center font-black text-primary leading-[0.8] tracking-tighter font-heading text-4xl sm:text-6xl md:text-8xl lg:text-[14rem] cursor-pointer select-none" style={{ WebkitTextStroke: '3px currentColor', textShadow: '4px 4px 0 rgba(0,0,0,0.2), -2px -2px 0 rgba(255,255,255,0.1)' }}>
                TAGUIG
              </h1>
            </div>
            <div className="mt-8 md:mt-12 lg:mt-16 flex flex-col items-center justify-center gap-3 md:gap-4">
              <p className="text-primary font-medium text-lg sm:text-xl md:text-2xl cursor-pointer select-none">
                Tara na!
              </p>
              <div className="cursor-pointer select-none">
                <ChevronDown
                  className="w-6 h-6 md:w-8 md:h-8 text-primary"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Animated content (rendered only on client)
  const AnimatedContent = () => (
    <section className="relative min-h-screen flex items-center justify-center">
      <MeshGradientBg variant="default" interactive={true} />
      <motion.div
        className="relative z-10 w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20"
        variants={animations.container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center text-center">
            <motion.h1
              className="font-black text-foreground text-center w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-4 select-none"
              variants={animations.fadeUp}
              style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1), -1px -1px 0 rgba(255,255,255,0.1)' }}
            >
              PAGBATI
            </motion.h1>
            <motion.h1
              className="text-center font-black text-primary leading-[0.8] mb-2 md:mb-4 tracking-tighter w-full font-heading text-4xl sm:text-6xl md:text-8xl lg:text-[12rem] cursor-pointer select-none"
              variants={animations.scaleIn}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{ WebkitTextStroke: '2px currentColor', textShadow: '3px 3px 0 rgba(0,0,0,0.2), -2px -2px 0 rgba(255,255,255,0.1)' }}
            >
              TECHSKHOLAR
            </motion.h1>
            <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-2 mb-4 md:mb-6">
              <motion.h1
                className="text-center font-black text-foreground font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl select-none"
                variants={animations.slideLeft}
                style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1), -1px -1px 0 rgba(255,255,255,0.1)' }}
              >
                ng
              </motion.h1>
              <motion.h1
                className="text-center font-black text-primary leading-[0.8] tracking-tighter font-heading text-6xl sm:text-7xl md:text-8xl lg:text-[20rem] cursor-pointer select-none"
                variants={animations.slideRight}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.96 }}
                style={{ WebkitTextStroke: '3px currentColor', textShadow: '4px 4px 0 rgba(0,0,0,0.2), -2px -2px 0 rgba(255,255,255,0.1)' }}
              >
                TAGUIG
              </motion.h1>
            </div>
            <motion.div
              className="mt-8 md:mt-12 lg:mt-16 flex flex-col items-center justify-center gap-3 md:gap-4"
              variants={animations.scrollDown}
            >
              <motion.p
                className="text-foreground font-medium text-lg sm:text-xl md:text-2xl cursor-pointer select-none"
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.92 }}
              >
                Tara na!
              </motion.p>
              <motion.div
                variants={animations.bounce}
                animate="animate"
                whileHover={{ scale: 1.3, y: -5, rotate: 180 }}
                className="cursor-pointer select-none"
                onClick={() => {
                  const aboutSection = document.querySelector("#about");
                  aboutSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <ChevronDown
                  className="w-6 h-6 md:w-8 md:h-8 transition-all duration-300 text-primary"
                  strokeWidth={2}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );

  return (
    <ClientOnly fallback={<StaticContent />}>
      <AnimatedContent />
    </ClientOnly>
  );
};

export default HeroSection;
