'use client';

import { motion } from 'framer-motion';
import { OrganizationPage } from '@/lib/data/organizationPages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

interface EventsSectionProps {
  events: OrganizationPage['events'];
  color: OrganizationPage['color'];
}

export default function EventsSection({ events, color }: EventsSectionProps) {
  // Helper to get random stats since we don't have them in the data
  const getSimulatedStats = (title: string) => {
    // Generate semi-deterministic stats based on title length
    const attendees = 50 + (title.length * 5);
    const location = title.includes('Hackathon') ? 'Innovation Hub' : title.includes('Workshop') ? 'Computer Lab 3' : 'Main Auditorium';
    const date = title.includes('Weekly') ? 'Every Wednesday' : 'Upcoming: Oct 24';
    return { attendees, location, date };
  };

  return (
    <section className="py-24 max-w-7xl mx-auto  relative overflow-hidden">
      {/* Background Dots Pattern (Simulated) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-50" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium tracking-wider uppercase" style={{ color: color.primary }}>
            Join Us
          </p>
          <h2 className="text-4xl font-bold lg:text-5xl bg-clip-text text-transparent leading-tight" style={{ 
            backgroundImage: `linear-gradient(to right, ${color.primary}, ${color.secondary})`
          }}>
            Upcoming Events <br className="hidden md:block" />
            & Gatherings
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-balance">
            Discover how we build community and foster growth through our regular events, workshops, and competitions.
          </p>
        </div>
        <Button asChild variant="default" className="rounded-md px-6 bg-foreground text-background hover:bg-foreground/90">
          <Link href="/events">
            See all events <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event, idx) => {
          const stats = getSimulatedStats(event.title);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                href="/events"
                className="group relative flex flex-col justify-between p-8 rounded-lg bg-card border border-border/50 hover:shadow-lg transition-all duration-300 h-full"
              >
                {/* Top Row: Header Info */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2 max-w-[75%]">
                     <Badge 
                        variant="secondary" 
                        className="font-medium px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider mb-2"
                        style={{ backgroundColor: `${color.primary}15`, color: color.primary }}
                      >
                        {event.frequency}
                      </Badge>
                     <h3 className="text-2xl font-bold text-foreground leading-snug">
                        {event.title}
                     </h3>
                  </div>
                  
                  {/* Decorative Gradient Circle moved to top right */}
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br shadow-inner flex items-center justify-center text-white font-bold text-xs"
                    style={{
                        backgroundImage: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`
                    }}
                  >
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow mb-8 text-muted-foreground leading-relaxed text-base">
                  <p>{event.description}</p>
                </div>

                {/* Dynamic Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-border/40">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{stats.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                         <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{stats.location}</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm text-foreground/80 col-span-2">
                         <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Expected attendees: {stats.attendees}+</span>
                    </div>
                </div>

                {/* Bottom Row: CTA */}
                <div className="flex justify-between items-center mt-auto">
                  <div 
                    className="rounded-md px-5 py-2 text-sm font-medium bg-foreground text-background group-hover:bg-foreground/90 flex items-center gap-2 transition-all w-full justify-center"
                  >
                    View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
