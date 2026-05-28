"use client";

import React from "react";
import { lazy } from "react";

const HeroSection = lazy(
  () => import("@/components/sections/landingpage/heroSection")
);

const CICTSection = lazy(
  () => import("@/components/sections/landingpage/CICT-Section")
);

const NewsSection = lazy(
  () => import("@/components/sections/landingpage/newsSection")
);

const FAQsSection = lazy(
  () => import("@/components/sections/landingpage/faqsSection")
);

const StorySection = lazy(
  () => import("@/components/sections/landingpage/storySection")
);

const TestimonialSeciton = lazy(
  () => import("@/components/sections/landingpage/Testimonial")
);

const SpotlightOrganizations = lazy(
  () => import("@/components/sections/landingpage/spotlightOrganizationsSection")
);

const SpotlightAchievements = lazy(
  () => import("@/components/sections/landingpage/spotlightAchievementsSection")
);



interface OptimizedLayoutProps {
  children?: React.ReactNode;
}

const OptimizedLayout = ({ children }: OptimizedLayoutProps) => {
  return (
    <div className="bg-background dark:bg-background">
      <div className="relative">
        {/* Hero Section - Background handled internally by HeroSection */}
        <div className="relative">
          <HeroSection />
        </div>

        {/* Other Sections */}
        <CICTSection />
        <StorySection />
        <SpotlightOrganizations />
        <SpotlightAchievements />
        <NewsSection />
        <FAQsSection />
        <TestimonialSeciton />
        
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default OptimizedLayout;
