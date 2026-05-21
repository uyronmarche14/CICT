import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PublicSectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
  descriptionClassName?: string;
}

export default function PublicSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  actions,
  className,
  titleClassName,
  eyebrowClassName,
  descriptionClassName,
}: PublicSectionHeaderProps) {
  if (actions) {
    return (
      <div className={cn("grid gap-6 md:grid-cols-2 md:items-end", className)}>
        <div className="space-y-4 text-left">
          <span
            className={cn(
              "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground",
              eyebrowClassName
            )}
          >
            {eyebrow}
          </span>
          <h2
            className={cn(
              "text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl lg:text-6xl",
              titleClassName
            )}
          >
            {title}
          </h2>
        </div>

        <div className="space-y-4 text-left">
          {description ? (
            <p className={cn("text-muted-foreground", descriptionClassName)}>{description}</p>
          ) : null}
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "mx-auto flex max-w-3xl flex-col items-center text-center" : "max-w-2xl text-left",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground",
          eyebrowClassName
        )}
      >
        {eyebrow}
      </span>
      <h2
        className={cn(
          "text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl lg:text-6xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-lg text-muted-foreground",
            align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl",
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
