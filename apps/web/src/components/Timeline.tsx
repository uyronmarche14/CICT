'use client';

import { useState } from 'react';
import { Award, Briefcase, GraduationCap, Rocket, Star, ChevronDown, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import type { TimelineEvent } from './organizations/organizationData';

interface TimelineProps {
  events: TimelineEvent[];
  accentColor: string;
}

const categoryIcons = {
  achievement: Star,
  project: Briefcase,
  milestone: Rocket,
  award: Award,
  education: GraduationCap,
};

export default function Timeline({ events, accentColor }: TimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative py-8">
      {/* Vertical Line */}
      <div 
        className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accentColor}30, transparent)`
        }}
      />

      {/* Timeline Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = categoryIcons[event.category];
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="relative pl-20 group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Year Badge */}
              <div className="absolute left-0 top-0">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 shadow-lg"
                  style={{
                    backgroundColor: isHovered ? accentColor : 'hsl(var(--background))',
                    borderColor: accentColor,
                    color: isHovered ? 'white' : accentColor,
                    transform: isHovered ? 'scale(1.15) rotate(5deg)' : 'scale(1) rotate(0deg)',
                    boxShadow: isHovered ? `0 12px 32px ${accentColor}50` : '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {event.year}
                </div>
              </div>

              {/* Content Card */}
              <div
                className="relative transition-all duration-500 ease-out"
                style={{
                  transform: isHovered ? 'translateX(16px) translateY(-4px)' : 'translateX(0) translateY(0)',
                }}
              >
                {/* Main Card - Dark Professional Style */}
                <div
                  className="rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-sm"
                  style={{
                    borderColor: isHovered ? accentColor : 'hsl(var(--border))',
                    backgroundColor: isHovered 
                      ? 'hsl(var(--card))' 
                      : 'hsl(var(--background))',
                    boxShadow: isHovered 
                      ? `0 24px 48px -12px ${accentColor}25, 0 0 0 1px ${accentColor}30, inset 0 1px 0 0 ${accentColor}10` 
                      : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Header Section */}
                  <div className="p-6 pb-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="p-3.5 rounded-xl transition-all duration-500 shadow-sm"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                          transform: isHovered ? 'rotate(8deg) scale(1.1)' : 'rotate(0) scale(1)',
                          boxShadow: isHovered ? `0 8px 16px ${accentColor}20` : 'none',
                        }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Title & Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-foreground leading-tight mb-1">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{event.year}</span>
                              <span className="text-border">•</span>
                              <span className="capitalize">{event.category}</span>
                            </div>
                          </div>
                          
                          {/* Expand Indicator */}
                          <div 
                            className="transition-all duration-500 p-1.5 rounded-lg"
                            style={{
                              transform: isHovered ? 'rotate(180deg)' : 'rotate(0)',
                              backgroundColor: isHovered ? `${accentColor}15` : 'transparent',
                              color: accentColor,
                            }}
                          >
                            <ChevronDown className="h-5 w-5" />
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div
                    className="overflow-hidden transition-all duration-500 ease-out"
                    style={{
                      maxHeight: isHovered ? '600px' : '0',
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    {event.details && event.details.length > 0 && (
                      <div 
                        className="px-6 pb-6 pt-2"
                        style={{
                          borderTop: isHovered ? `1px solid ${accentColor}10` : 'none',
                          backgroundColor: isHovered ? `${accentColor}03` : 'transparent',
                        }}
                      >
                        {/* Section Header */}
                        <div className="mb-4 mt-2">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp 
                              className="h-4 w-4" 
                              style={{ color: accentColor }}
                            />
                            <h4 
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color: accentColor }}
                            >
                              Key Achievements & Impact
                            </h4>
                          </div>
                          <div 
                            className="h-px w-full"
                            style={{ 
                              background: `linear-gradient(to right, ${accentColor}40, transparent)` 
                            }}
                          />
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-3">
                          {event.details.map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:translate-x-1"
                              style={{
                                animation: isHovered 
                                  ? `slideInDetail 0.5s ease-out ${idx * 0.1}s both` 
                                  : 'none',
                                backgroundColor: `${accentColor}05`,
                                border: `1px solid ${accentColor}10`,
                              }}
                            >
                              {/* Check Icon */}
                              <div
                                className="mt-0.5 p-1.5 rounded-lg transition-all duration-300 flex-shrink-0"
                                style={{
                                  backgroundColor: `${accentColor}15`,
                                }}
                              >
                                <CheckCircle2 
                                  className="h-4 w-4" 
                                  style={{ color: accentColor }}
                                />
                              </div>
                              
                              {/* Detail Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground font-medium leading-relaxed">
                                  {detail}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer Stats */}
                        <div 
                          className="mt-4 pt-4 flex items-center justify-between text-xs"
                          style={{
                            borderTop: `1px solid ${accentColor}10`,
                          }}
                        >
                          <span className="text-muted-foreground">
                            {event.details.length} key highlights
                          </span>
                          <div 
                            className="px-3 py-1.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${accentColor}10`,
                              color: accentColor,
                            }}
                          >
                            {event.category}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slideInDetail {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
