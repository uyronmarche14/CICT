import type { AboutItem } from "./about-data";

export default function AboutVisual({ item }: { item: AboutItem }) {
  if (item.visualType === "story") {
    const steps = ["Idea", "Build", "Launch", "Grow"];
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.03] p-8 md:min-h-[260px]">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5 text-[11px] font-bold text-primary">
                  {i + 1}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
          <div className="relative h-0.5 w-full bg-primary/10">
            <div className="absolute left-0 top-0 h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary/60" />
          </div>
        </div>
      </div>
    );
  }

  if (item.visualType === "mission") {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.03] p-8 md:min-h-[260px]">
        <div className="flex w-full flex-col gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">Mission</span>
            </div>
            <p className="pl-9 text-xs leading-relaxed text-muted-foreground">
              Create digital experiences that make information, services, and processes easier to access.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                <div className="h-2 w-2 rounded-full bg-secondary" />
              </div>
              <span className="text-sm font-semibold text-secondary">Vision</span>
            </div>
            <p className="pl-9 text-xs leading-relaxed text-muted-foreground">
              Build a reliable digital environment where everyone can connect, participate, and stay informed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (item.visualType === "build") {
    const platforms = ["Web", "Mobile", "Dashboard", "Portal"];
    return (
      <div className="flex h-full min-h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.03] p-8 md:min-h-[200px]">
        <div className="grid w-full grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <div
              key={platform}
              className="flex items-center justify-center rounded-lg border border-primary/10 bg-background px-3 py-4 text-xs font-semibold text-foreground"
            >
              {platform}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.visualType === "process") {
    const steps = ["Discover", "Plan", "Design", "Build", "Review", "Improve"];
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.03] p-8 md:min-h-[260px]">
        <div className="flex w-full flex-col gap-2">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="h-2 flex-1 rounded-full bg-primary/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary/60"
                  style={{ width: `${((i + 1) / 6) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-[10px] font-medium text-muted-foreground">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.visualType === "values") {
    const values = [
      { label: "Clarity", color: "bg-primary/10 text-primary" },
      { label: "Reliability", color: "bg-secondary/10 text-secondary" },
      { label: "Accessibility", color: "bg-accent/10 text-accent-foreground" },
      { label: "Collaboration", color: "bg-primary/10 text-primary" },
      { label: "Improvement", color: "bg-secondary/10 text-secondary" },
    ];
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.03] p-8 md:min-h-[260px]">
        <div className="grid w-full grid-cols-2 gap-3">
          {values.map((v) => (
            <div
              key={v.label}
              className={`flex items-center justify-center rounded-lg px-3 py-4 text-center text-[11px] font-bold ${v.color}`}
            >
              {v.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl bg-muted/30 md:min-h-[260px]">
      <span className="text-sm text-muted-foreground">{item.title}</span>
    </div>
  );
}
