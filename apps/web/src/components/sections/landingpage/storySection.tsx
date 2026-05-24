"use client";

import React from "react";
import { lazy, Suspense } from "react";

const AboutWithTabs = lazy(
  () => import("@/components/organizations/index")
);

const StorySection = () => {
  return (
    <section id="story" className="w-full scroll-mt-20">
      <Suspense 
        fallback={
          <div className="min-h-[600px] flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto px-4">
              <div className="h-8 bg-muted rounded-lg w-1/3 mx-auto" />
              <div className="h-4 bg-muted rounded-lg w-2/3 mx-auto" />
              <div className="h-64 bg-muted rounded-2xl w-full mt-8" />
            </div>
          </div>
        }
      >
        <AboutWithTabs />
      </Suspense>
    </section>
  );
};

export default StorySection;
