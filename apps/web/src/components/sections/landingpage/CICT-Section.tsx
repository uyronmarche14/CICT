import React, { useState } from "react";
import Image from "next/image";

import PublicSectionHeader from "@/components/sections/landingpage/PublicSectionHeader";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Mission",
    description:
      "To provide world-class education and training in information and communication technology, empowering students to become innovative leaders.",
  },
  {
    title: "Vision",
    description:
      "A premier institution recognized globally for excellence in ICT education, research, and community service.",
  },
  {
    title: "Philosophy",
    description:
      "We believe in the power of technology to transform lives and drive sustainable progress for a better future.",
  },
];

const CICTSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="overflow-hidden bg-background py-20 text-foreground md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">

          {/* ── Left: Image card ── */}
          <div className="group relative min-h-[480px] overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_30px_90px_-60px_rgba(15,23,42,0.5)] lg:min-h-[620px]">
            <Image
              src="https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg"
              alt="CICT students and faculty gathered during a campus event"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              priority
            />

            {/* top-to-mid fade for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/80" />

            {/* Bottom caption strip — mirrors the reference image's dark footer */}
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-background/80 px-6 py-5 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                Campus Community
              </p>
              <p className="mt-1.5 text-base font-semibold text-foreground">
                Where learning meets leadership
              </p>
            </div>
          </div>

          {/* ── Right: Text + feature cards ── */}
          <div className="flex flex-col justify-center gap-8 lg:pl-2">
            <PublicSectionHeader
              eyebrow="College of Information and Communication Technology"
              title="Shaping future-ready technology leaders"
              description="CICT equips students with strong computing foundations, practical industry skills, and a collaborative campus culture built for innovation."
              align="start"
              className="max-w-none"
              titleClassName="text-3xl md:text-4xl lg:text-[2.6rem] leading-[1.15]"
              descriptionClassName="text-sm leading-7 md:text-base text-muted-foreground"
            />

            {/* Interactive Mission / Vision / Philosophy cards */}
            <div className="grid gap-3">
              {features.map((feature, idx) => {
                const isActive = idx === activeFeature;

                return (
                  <button
                    key={feature.title}
                    type="button"
                    onMouseEnter={() => setActiveFeature(idx)}
                    onFocus={() => setActiveFeature(idx)}
                    className={cn(
                      "group flex rounded-[1.5rem] py-4 text-left transition-all duration-300 ",

                    )}
                  >
                    <div className="flex w-full gap-4">
                      {/* Dot indicator */}
                      <div className="pt-[5px]">
                        <span
                          className={cn(
                            "block h-2.5 w-2.5 rounded-full transition-colors duration-300",
                            isActive ? "bg-primary" : "bg-primary/30"
                          )}
                        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <h3
                          className={cn(
                            "text-base font-semibold tracking-[0.04em] transition-colors duration-200",
                            isActive ? "text-foreground" : "text-foreground/75"
                          )}
                        >
                          {feature.title}
                        </h3>
                        <p
                          className={cn(
                            "mt-2 text-sm leading-6 transition-colors duration-200",
                            isActive
                              ? "text-muted-foreground"
                              : "text-muted-foreground/70"
                          )}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CICTSection;