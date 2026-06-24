'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EventCarousel } from '@/components/events/EventCarousel';
import { eventAPI } from '@/lib/api/event';
import { ContentOwnerType } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export default function EventsSection() {
  const { data: systemEvents, isLoading: systemLoading } = useQuery({
    queryKey: ['events', 'landing', 'system'],
    queryFn: () => eventAPI.getAll({ limit: 6, status: 'published', upcoming: true, ownerType: ContentOwnerType.SYSTEM }),
    staleTime: 0,
  });

  const { data: orgEvents, isLoading: orgLoading } = useQuery({
    queryKey: ['events', 'landing', 'organization'],
    queryFn: () => eventAPI.getAll({ limit: 6, status: 'published', upcoming: true, ownerType: ContentOwnerType.ORGANIZATION }),
    staleTime: 0,
  });

  const allEvents = [
    ...(systemEvents?.data?.events ?? []),
    ...(orgEvents?.data?.events ?? []),
  ];

  const isLoading = systemLoading || orgLoading;

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <SectionHeader title="Upcoming Events" subtitle="Events and activities from CICT and organizations" centered />
        </motion.div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : allEvents.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">No upcoming events at this time.</p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="w-full"
          >
            <EventCarousel events={allEvents} />
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } },
          }}
          className="flex justify-center mt-12 pb-4"
        >
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/events">
              View all events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
