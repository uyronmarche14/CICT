'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border mb-4 shadow-xl">
          <Construction className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {title}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground">
            Coming Soon
          </h2>
          <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-lg mx-auto">
            {description}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild variant="outline" className="rounded-full px-8 h-12">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild className="rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/contact">
              Contact Us
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
