"use client";

import { useState } from "react";
import { aboutTabs } from "@/lib/about-content";
import { RenderSection } from "./tabs/render-section";

export function AboutContentTabs() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <section className="relative bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile: horizontal tab scroll */}
        <div className="sticky top-[72px] z-30 -mx-4 sm:-mx-6 lg:-mx-8 md:hidden overflow-x-auto border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="flex gap-0 px-4 sm:px-6 lg:px-8">
            {aboutTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <span className="text-[10px] font-mono opacity-50">{tab.number}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Desktop: sidebar + content grid */}
        <div className="flex gap-0 pt-2">
          {/* Sidebar */}
          <aside className="hidden md:block w-[250px] shrink-0">
            <nav className="sticky top-[88px]">
              <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                On this page
              </p>
              {aboutTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-surface-soft hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-mono font-bold transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-soft text-muted-foreground group-hover:bg-muted-foreground/10"
                    }`}
                  >
                    {tab.number}
                  </span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1 md:pl-12 ">
            <div className="pb-8 md:pb-12">
              {aboutTabs.map((tab) => (
                <div
                  key={tab.id}
                  role="tabpanel"
                  id={`about-panel-${tab.id}`}
                  className={activeTab === tab.id ? "block" : "hidden"}
                >
                  <article>
                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {tab.eyebrow}
                      </p>
                      <h2 className="mt-2 text-2xl font-black leading-tight text-foreground sm:text-3xl md:text-4xl">
                        {tab.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {tab.summary}
                      </p>
                    </div>

                    <div className="space-y-0">
                      {tab.sections.map((section, i) => (
                        <RenderSection key={i} block={section} index={i} />
                      ))}
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
