"use client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Mail, Newspaper, Users } from "lucide-react";

const footerLinks = [
  { label: "Contact Office", href: "/contact", icon: Mail },
  { label: "Updates", href: "/news", icon: Newspaper },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Student Life", href: "/student-life", icon: Users },
];

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-gradient-to-b from-background to-primary/20 overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-1/4 w-40 h-40 bg-atmosphere-violet/35 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 right-1/4 w-40 h-40 bg-atmosphere-rose/25 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
        {/* Top row: description left, links right */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              CICT TECHSKOLAR 
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The College of Information and Communication Technology supports students through technology education, student organizations, events, and campus community updates.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {footerLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-hairline bg-background/70 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                aria-label={label}
                title={label}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* College info + page links */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative p-4 rounded-full border border-primary/20 bg-surface-elevated/80 backdrop-blur-sm shadow-[0_0_40px_rgba(110,41,246,0.1)]">
              <Image
                src="/images/techskolar.png"
                alt="TechSkolar Logo"
                width={120}
                height={120}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
              />
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            College of Information and Communication Technology
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/academics" className="hover:text-primary transition-colors">Academics</Link>
            <Link href="/admissions" className="hover:text-primary transition-colors">Admissions</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} CICT. All rights reserved.
          </p>
        </div>
      </div>

      {/* CICT wordmark - massive at bottom edge, bleeding out */}
      <div className="relative z-0 -mb-10">
        <h2 className="text-center font-extrabold text-6xl sm:text-8xl md:text-[14rem] lg:text-[17rem] text-primary leading-none tracking-tight select-none"
          style={{ fontFamily: "Blockletter, Inter, sans-serif" }}>
          CICT TECHSKOLAR
        </h2>
      </div>
    </footer>
  );
}
