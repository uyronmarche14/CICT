'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SlideData {
  image: string;
  title: string;
  description: string;
  alt: string;
}

interface AboutCarouselProps {
  slides: SlideData[];
}

export default function AboutCarousel({ slides }: AboutCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center justify-center bg-background py-8">
      {/* Slides Container */}
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
            x = 0;
            scale = 1;
            zIndex = 10;
            opacity = 1;
          } else if (position === -1 || position === slides.length - 1) {
            // Left slide - adjusted x to overlap
            x = -75;
            scale = 0.85;
            zIndex = 5;
            opacity = 0.3;
          } else if (position === 1 || position === -(slides.length - 1)) {
            // Right slide - adjusted x to overlap
            x = 75;
            scale = 0.85;
            zIndex = 5;
            opacity = 0.3;
          } else {
            // Hidden slides
            x = 0;
            scale = 0.8;
            zIndex = 0;
            opacity = 0;
          }

          return (
            <motion.div
              key={index}
              className="absolute w-[calc(100%-2rem)] max-w-6xl h-[90%] rounded-xl md:rounded-3xl overflow-hidden border border-border/50 shadow-2xl pointer-events-auto"
              initial={false}
              animate={{
                x: `${x}%`,
                scale,
                zIndex,
                opacity
              }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <CldImage 
                src={slide.image} 
                fill 
                alt={slide.alt} 
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, 1152px"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Content - Only visible on active slide */}
              <motion.div 
                className="absolute inset-0 flex flex-col justify-end p-6 md:p-12"
                animate={{ opacity: position === 0 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 tracking-tighter uppercase leading-[1.1]">
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

      {/* Navigation Controls (Side Arrows) */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={prevSlide} 
        className="absolute left-2 md:left-8 z-20 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 pointer-events-auto"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={nextSlide} 
        className="absolute right-2 md:right-8 z-20 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 pointer-events-auto"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </Button>

      {/* Bottom Progress/Dots Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-auto">
        {slides.map((_, idx) => (
          <Button 
            key={idx} 
            variant="ghost" 
            size="sm"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`min-w-0 p-0 h-1.5 transition-all duration-500 rounded-full ${
              idx === currentIndex ? "w-10 bg-primary" : "w-4 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
