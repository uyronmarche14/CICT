"use client";

import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AboutItem } from "./about-data";

export default function AboutListRow({
  item,
  isOpen,
  onToggle,
}: {
  item: AboutItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "group transition-colors",
        isOpen ? "bg-muted/20" : "hover:bg-muted/10"
      )}
    >
      <button
        type="button"
        id={`about-row-${item.id}`}
        aria-expanded={isOpen}
        aria-controls={`about-panel-${item.id}`}
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-6 text-left md:px-8 md:py-8"
      >
        <span
          className={cn(
            "hidden w-10 shrink-0 text-[13px] font-mono font-semibold transition-colors sm:block",
            isOpen
              ? "text-primary"
              : "text-muted-foreground group-hover:text-primary"
          )}
        >
          {item.number}
        </span>

        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-lg font-bold transition-colors md:text-2xl lg:text-3xl",
              isOpen
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {item.title}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground/60 md:text-sm">
            {item.subtitle}
          </span>
        </div>

        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
            isOpen
              ? "border-primary bg-primary text-primary-foreground"
              : "border-hairline text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
          )}
        >
          {isOpen ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
          )}
        </div>
      </button>
    </div>
  );
}
