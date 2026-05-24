'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OrganizationPage } from '@/lib/data/organizationPages';

interface ProgramsTabsProps {
  programs: OrganizationPage['programs'];
  color: OrganizationPage['color'];
}

export default function ProgramsTabs({ programs, color }: ProgramsTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">What We Offer</h2>
        <p className="text-muted-foreground text-lg">Key programs and initiatives</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side: Tabs */}
        <div className="w-full lg:w-1/3 space-y-2">
          {programs.map((program, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "w-full text-left px-6 py-4 rounded-lg transition-all duration-300 group relative",
                activeTab === idx 
                  ? "bg-muted/40 text-foreground" 
                  : "bg-transparent text-muted-foreground hover:bg-muted/20 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-4">
                
                <div>
                  <h3 className="font-semibold text-base">
                    {program.title}
                  </h3>
                </div>
                {/* Active Indicator Dot */}
                {activeTab === idx && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute right-4 w-2 h-2 rounded-full ml-auto"
                    style={{ backgroundColor: color.primary }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Right Side: Content */}
        <div className="w-full lg:w-2/3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col rounded-md border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
              {/* Image Area */}
              <div className="relative h-48 sm:h-64 w-full bg-muted/30">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl opacity-10 grayscale">{programs[activeTab].icon}</span>
                 </div>
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`
                    }}
                  />
              </div>
              
              {/* Content Area */}
              <div className="p-8 flex-1 flex flex-col">
                 <div className="mb-4">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                        {programs[activeTab].title}
                    </h3>
                 </div>
                 
                 <p className="text-lg text-muted-foreground leading-relaxed">
                    {programs[activeTab].description}
                 </p>

                 {/* Minimal Footer Info */}
                 <div className="mt-8 pt-6 border-t border-border/30 grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Focus</span>
                        <p className="text-sm font-medium mt-1">Skill Development</p>
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Frequency</span>
                        <p className="text-sm font-medium mt-1">Ongoing</p>
                    </div>
                 </div>
              </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
