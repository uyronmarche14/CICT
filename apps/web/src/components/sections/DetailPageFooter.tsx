'use client';

import React from 'react';

export default function DetailPageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full py-16 bg-background flex flex-col justify-center items-center border-t border-border">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6 mb-8">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary transition-all duration-500 hover:from-primary hover:to-secondary">
              CICT
            </h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-extrabold text-4xl sm:text-6xl md:text-8xl lg:text-9xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary hover:from-primary hover:to-secondary transition-all duration-500 leading-none">
              LET&apos;S BUILD
            </h2>
          </div>

          <div className="text-center space-y-4 max-w-2xl">
            <p className="text-muted-foreground text-sm">
              College of Information and Communication Technology
            </p>
            <p className="text-xs text-muted-foreground pt-4">
              © {currentYear} CICT. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
