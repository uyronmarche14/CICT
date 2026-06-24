import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({ title, subtitle, centered, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-10', centered && 'flex flex-col items-center text-center', className)}>
      <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>
      )}
      <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
    </div>
  );
}
