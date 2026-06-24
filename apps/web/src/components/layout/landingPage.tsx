"use client";

import React from "react";
import HeroSection from "@/components/sections/landingpage/heroSection";
import IntroSection from "@/components/sections/landingpage/introSection";
import StorySection from "@/components/sections/landingpage/storySection";
import NewsSection from "@/components/sections/landingpage/newsSection";
import EventsSection from "@/components/sections/landingpage/eventsSection";
import FAQsSection from "@/components/sections/landingpage/faqsSection";
import BrandSection from "@/components/sections/landingpage/BrandSection";
import ContactSection from "@/components/contact/contact-section";

interface OptimizedLayoutProps {
  children?: React.ReactNode;
}

const OptimizedLayout = ({ children }: OptimizedLayoutProps) => {
  return (
    <div className="bg-background dark:bg-background">
      <div className="relative">
        <div className="relative">
          <HeroSection />
        </div>

        <BrandSection />
        <IntroSection />
        <StorySection />
        <NewsSection />
        <EventsSection />
        <FAQsSection />
        <ContactSection />

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default OptimizedLayout;
