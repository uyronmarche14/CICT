"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AboutItem } from "./about-data";
import AboutVisual from "./about-visual";

export default function AboutExpandedPanel({ item }: { item: AboutItem }) {
  const isAltLayout = item.layout === "image-right";

  const containerClass =
    item.layout === "image-top"
      ? "space-y-6"
      : "grid gap-6 md:grid-cols-2";

  return (
    <div
      className={`bg-gradient-to-b from-muted/10 to-background px-5 py-8 md:px-8 md:py-10 ${containerClass}`}
    >
      {item.layout === "image-top" ? (
        <>
          <AboutVisual item={item} />
          <div className="space-y-4">
            <ContentPanel item={item} />
          </div>
        </>
      ) : isAltLayout ? (
        <>
          <div className="space-y-4">
            <ContentPanel item={item} />
          </div>
          <AboutVisual item={item} />
        </>
      ) : (
        <>
          <AboutVisual item={item} />
          <div className="space-y-4">
            <ContentPanel item={item} />
          </div>
        </>
      )}
    </div>
  );
}

function ContentPanel({ item }: { item: AboutItem }) {
  return (
    <>
      <h3 className="text-xl font-bold text-foreground md:text-2xl">
        {item.heading}
      </h3>
      {item.paragraphs.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {p}
        </p>
      ))}
      <ul className="space-y-1.5">
        {item.keyPoints.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {point}
          </li>
        ))}
      </ul>
      {item.cta && (
        <Button variant="default" size="sm" asChild className="mt-2">
          <Link href={item.cta.href}>{item.cta.label}</Link>
        </Button>
      )}
    </>
  );
}
