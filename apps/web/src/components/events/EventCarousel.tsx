'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventDetailCard } from '@/components/events/EventDetailCard';
import { Button } from '@/components/ui/button';
import type { Event } from '@/lib/api/event';

interface EventCarouselProps {
  events: Event[];
}

export function EventCarousel({ events }: EventCarouselProps) {
  const [index, setIndex] = useState(0);
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  if (events.length === 0) return null;

  const visibleEvents = events.slice(0, 5);
  const goTo = (i: number) => setIndex(Math.max(0, Math.min(i, visibleEvents.length - 1)));

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = e.clientX;
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    if (Math.abs(e.clientX - dragStart.current) > 10) isDragging.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - dragStart.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(index - 1);
      else goTo(index + 1);
    }
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - dragStart.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(index - 1);
      else goTo(index + 1);
    }
  };

  const getPosition = (i: number) => {
    let pos = i - index;
    if (pos < -1) pos += events.length;
    if (pos > 1) pos -= events.length;
    return pos;
  };

  return (
    <div
      className="select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative min-h-[580px] md:min-h-[680px] flex items-center justify-center">
        {visibleEvents.map((event, i) => {
          const pos = getPosition(i);
          let x = 0;
          let scale = 1;
          let zIndex = 0;
          let opacity = 1;

          if (pos === 0) {
            x = 0; scale = 1; zIndex = 10;
          } else if (pos === -1) {
            x = -22; scale = 0.88; zIndex = 5; opacity = 0.35;
          } else if (pos === 1) {
            x = 22; scale = 0.88; zIndex = 5; opacity = 0.35;
          } else {
            x = 0; scale = 0.8; zIndex = 0; opacity = 0;
          }

          return (
            <motion.div
              key={event._id}
              className="absolute w-full max-w-4xl"
              initial={false}
              animate={{ x: `${x}%`, scale, zIndex, opacity }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              style={{ pointerEvents: pos === 0 ? 'auto' : 'none' }}
            >
              <EventDetailCard event={event} />
            </motion.div>
          );
        })}
      </div>

      {events.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous event"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {visibleEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Show event ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            {index + 1} / {visibleEvents.length}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next event"
            onClick={() => goTo(index + 1)}
            disabled={index === visibleEvents.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
