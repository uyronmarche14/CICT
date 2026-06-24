import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AboutHero } from "@/components/sections/about/about-hero";
import { AboutContentTabs } from "@/components/sections/about/AboutContentTabs";

export const metadata: Metadata = {
  title: "About CICT | College of Information and Communication Technology",
  description:
    "Discover the College of Information and Communication Technology — our mission, vision, academic programs, innovation culture, campus life, and student organizations.",
  openGraph: {
    title: "About CICT",
    description:
      "Shaping future-ready technology leaders in Taguig through industry-aligned education, coding bootcamps, and a vibrant student community.",
    images: [
      {
        url: "https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg",
      },
    ],
  },
};

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingFallback />}>
        <AboutHero />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <AboutContentTabs />
      </Suspense>
    </main>
  );
}
