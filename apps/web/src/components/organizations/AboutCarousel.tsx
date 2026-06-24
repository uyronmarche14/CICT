'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Event } from '@/lib/api/event';

interface SlideData {
  image: string;
  title: string;
  description: string;
  alt: string;
}

interface EventSlidesCarouselProps {
  slides: SlideData[];
  events?: Event[];
}

export default function EventSlidesCarousel({ slides }: EventSlidesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = e.clientX;
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const diff = Math.abs(e.clientX - dragStart.current);
    if (diff > 10) isDragging.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - dragStart.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevSlide();
      else nextSlide();
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
      if (diff > 0) prevSlide();
      else nextSlide();
    }
  };

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden flex items-center justify-center bg-background rounded-xl cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {slides.map((slide, index) => {
          let position = index - currentIndex;
          if (position < -1) position += slides.length;
          if (position > 1) position -= slides.length;

          let x = 0;
          let scale = 1;
          let zIndex = 0;
          let opacity = 1;

          if (position === 0) {
            x = 0; scale = 1; zIndex = 10; opacity = 1;
          } else if (position === -1 || position === slides.length - 1) {
            x = -75; scale = 0.85; zIndex = 5; opacity = 0.3;
          } else if (position === 1 || position === -(slides.length - 1)) {
            x = 75; scale = 0.85; zIndex = 5; opacity = 0.3;
          } else {
            x = 0; scale = 0.8; zIndex = 0; opacity = 0;
          }

          return (
            <motion.div
              key={index}
              className="absolute w-[calc(100%-2rem)] max-w-6xl h-[85%] rounded-xl md:rounded-3xl overflow-hidden border border-border/50 shadow-2xl pointer-events-none"
              initial={false}
              animate={{ x: `${x}%`, scale, zIndex, opacity }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <CldImage
                src={slide.image}
                fill
                alt={slide.alt}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <motion.div
                className="absolute inset-0 flex flex-col justify-end p-6 md:p-12"
                animate={{ opacity: position === 0 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 tracking-normal uppercase leading-[1.1]">
                  {slide.title}
                </h3>
                <p className="text-white/80 max-w-xl text-sm md:text-lg font-medium leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <Button
        variant="ghost" size="icon" onClick={prevSlide}
        className="absolute left-2 md:left-8 z-20 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 pointer-events-auto"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
      <Button
        variant="ghost" size="icon" onClick={nextSlide}
        className="absolute right-2 md:right-8 z-20 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 pointer-events-auto"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </Button>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-auto">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
              idx === currentIndex ? "w-10 bg-primary" : "w-4 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
