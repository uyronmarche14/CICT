"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MapPin, GraduationCap, Code, Users, RefreshCw, Calendar, Handshake, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MeshGradientBg from "@/components/ripplebg";
import { aboutTabs, TabContent } from "@/lib/about-content";

function extractImages(tab: TabContent): string[] {
  const imgs: string[] = [];
  for (const section of tab.sections) {
    if (section.type === "heroIntro" && section.image) {
      imgs.push(section.image);
    }
    if (section.type === "text" && section.image) {
      imgs.push(section.image);
    }
    if (section.type === "imageGrid") {
      for (const img of section.images) {
        imgs.push(img.src);
      }
    }
  }
  return imgs;
}

function extractTexts(tab: TabContent): string[] {
  const texts: string[] = [];
  for (const section of tab.sections) {
    if (section.type === "text") {
      texts.push(section.content);
    }
  }
  return texts;
}

function extractBullets(tab: TabContent): string[] {
  const bullets: string[] = [];
  for (const section of tab.sections) {
    if (section.type === "list") {
      for (const item of section.items) {
        bullets.push(item.text);
      }
    }
  }
  return bullets;
}

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [imgIndex, setImgIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const active = useMemo(
    () => aboutTabs.find((t) => t.id === activeTab) ?? aboutTabs[0],
    [activeTab]
  );

  const images = useMemo(() => extractImages(active), [active]);
  const texts = useMemo(() => extractTexts(active), [active]);
  const bullets = useMemo(() => extractBullets(active), [active]);

  useEffect(() => {
    setImgIndex(0);
    setIsPaused(false);
  }, [active.id]);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const t = setInterval(() => setImgIndex((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [active.id, isPaused, images.length]);

  return (
    <section className="relative min-h-screen flex items-start justify-center pt-28 lg:pt-32 bg-gradient-to-b from-primary/20 via-primary/8 via-secondary/5 to-background">
      <MeshGradientBg variant="vibrant" interactive={false} />
      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 lg:pb-32">
        <div className="flex flex-col gap-6">
          <div className="w-full max-w-7xl flex flex-col items-center gap-0">
            <p className="text-center font-display font-black text-white tracking-wide text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3">
              Pagbati!
            </p>

            <h1
              className="text-center font-black text-primary leading-[0.85] tracking-normal text-5xl sm:text-7xl md:text-[8rem] lg:text-[12rem] xl:text-[15rem] mb-0"
              style={{ fontFamily: "Blockletter, Inter, sans-serif", textShadow: '0 2px 0 #5A22D4, 0 4px 0 #4A1BB5, 0 6px 0 #3A1496, 0 8px 0 #2A0D78, 0 10px 10px rgba(0,0,0,0.25)' }}
            >
              TECHSKOLAR
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3">
              <h1
                className="text-center font-black text-foreground leading-[0.85] tracking-normal text-5xl sm:text-7xl md:text-[8rem] lg:text-[12rem] xl:text-[15rem]"
                style={{ fontFamily: "Blockletter, Inter, sans-serif", textShadow: '0 2px 0 rgba(0,0,0,0.25), 0 4px 0 rgba(0,0,0,0.2), 0 6px 0 rgba(0,0,0,0.15), 0 8px 0 rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.2)' }}
              >
                NG
              </h1>
              <h1
                className="text-center font-black text-primary leading-[0.85] tracking-normal text-5xl sm:text-7xl md:text-[8rem] lg:text-[12rem] xl:text-[15rem]"
                style={{ fontFamily: "Blockletter, Inter, sans-serif", textShadow: '0 2px 0 #5A22D4, 0 4px 0 #4A1BB5, 0 6px 0 #3A1496, 0 8px 0 #2A0D78, 0 10px 10px rgba(0,0,0,0.25)' }}
              >
                TAGUIG
              </h1>
            </div>
          </div>

          <p className="text-center text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Real skills. Real projects. Real impact.{" "}
            CICT empowers{" "}
            <Tooltip>
              <TooltipTrigger className="border-b border-dashed border-muted-foreground/20 hover:border-primary hover:text-primary hover:bg-primary/[0.06] rounded px-0.5 transition-all cursor-help">
                Taguig&apos;s youth
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4 text-center bg-surface-elevated/95 backdrop-blur-md border border-border text-foreground shadow-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold mb-1 text-sm">Taguig Youth</p>
                <p className="text-xs text-muted-foreground">
                  Over 10,000 students across Taguig City participating in CICT programs.
                </p>
              </TooltipContent>
            </Tooltip>{" "}
            through{" "}
            <Tooltip>
              <TooltipTrigger className="border-b border-dashed border-muted-foreground/20 hover:border-primary hover:text-primary hover:bg-primary/[0.06] rounded px-0.5 transition-all cursor-help">
                tech education
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4 text-center bg-surface-elevated/95 backdrop-blur-md border border-border text-foreground shadow-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold mb-1 text-sm">Tech Education</p>
                <p className="text-xs text-muted-foreground">
                  Curriculum aligned with industry standards — web dev, AI, cybersecurity, and more.
                </p>
              </TooltipContent>
            </Tooltip>,{" "}
            <Tooltip>
              <TooltipTrigger className="border-b border-dashed border-muted-foreground/20 hover:border-primary hover:text-primary hover:bg-primary/[0.06] rounded px-0.5 transition-all cursor-help">
                coding bootcamps
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4 text-center bg-surface-elevated/95 backdrop-blur-md border border-border text-foreground shadow-lg">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <Code className="w-5 h-5 text-secondary" />
                </div>
                <p className="font-semibold mb-1 text-sm">Coding Bootcamps</p>
                <p className="text-xs text-muted-foreground">
                  Intensive workshops building real-world applications with modern tools.
                </p>
              </TooltipContent>
            </Tooltip>,{" "}
            and a growing{" "}
            <Tooltip>
              <TooltipTrigger className="border-b border-dashed border-muted-foreground/20 hover:border-primary hover:text-primary hover:bg-primary/[0.06] rounded px-0.5 transition-all cursor-help">
                community of innovators
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4 text-center bg-surface-elevated/95 backdrop-blur-md border border-border text-foreground shadow-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold mb-1 text-sm">Community</p>
                <p className="text-xs text-muted-foreground">
                  A network of student developers, designers, and entrepreneurs driving change.
                </p>
              </TooltipContent>
            </Tooltip>.
          </p>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-border bg-surface-elevated text-muted-foreground shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              Latest Updates
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-primary text-primary-foreground shadow-md">
              <Calendar className="w-3.5 h-3.5" />
              Campus Events
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-md">
              <Handshake className="w-3.5 h-3.5" />
              Organization Collaboration
            </span>
          </div>

          {/* Tab Panel */}
          <div className="w-full rounded-xl border border-border bg-surface-elevated shadow-[0_8px_40px_-12px_rgba(47,22,95,0.18)] overflow-hidden">
            <div className="flex flex-col">
              <div className="border-b border-border bg-muted/30 p-2 sm:p-3">
                <nav role="tablist" className="flex gap-0 w-full overflow-x-auto scrollbar-none">
                  {aboutTabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`hero-panel-${tab.id}`}
                      id={`hero-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm transition-all whitespace-nowrap text-center ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs font-mono mr-1.5 opacity-50">{tab.number}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <motion.article
                role="tabpanel"
                id={`hero-panel-${active.id}`}
                aria-labelledby={`hero-tab-${active.id}`}
                className="flex-1 p-6 md:p-10"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                }}
              >
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                >
                  {active.eyebrow}
                </motion.p>
                <motion.h3
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                  className="mt-3 text-2xl font-black leading-tight text-foreground md:text-3xl"
                >
                  {active.title}
                </motion.h3>
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                  className="mt-4 text-base leading-7 text-muted-foreground max-w-2xl"
                >
                  {active.summary}
                </motion.p>

                {images.length > 0 && (
                  <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                    className="relative mt-6 rounded-xl overflow-hidden border border-border bg-muted/30"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div className="relative h-72 w-full sm:h-80 md:h-[28rem] lg:h-[34rem]">
                      {images.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt=""
                          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                            i === imgIndex ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      ))}
                    </div>
                    {images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIndex(i)}
                            className={`rounded-full transition-all ${
                              i === imgIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                  className="mt-7 space-y-5"
                >
                  {texts.length > 0 && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {texts[0].length > 300 ? texts[0].slice(0, 300) + "..." : texts[0]}
                    </p>
                  )}

                  {bullets.length > 0 && (
                    <ul className="space-y-2">
                      {bullets.slice(0, 4).map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>

                <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                  className="mt-8 flex items-center gap-4"
                >
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/updates"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:text-primary"
                  >
                    Explore Updates
                  </Link>
                </motion.div>
              </motion.article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
