"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import AboutList from "@/components/about/about-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export default function IntroSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <SectionHeader
            title="About Us"
            subtitle="The College of Information and Communication Technology — empowering Taguig's youth through accessible, industry-aligned technology education."
            centered
          />
        </motion.div>

        <AboutList />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } },
          }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild>
            <Link href="/about">
              Learn More About CICT
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">
              <MessageCircle className="mr-1.5 h-4 w-4" />
              Contact CICT
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
