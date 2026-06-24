import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <div className="flex flex-col items-center gap-4">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-black text-primary leading-none tracking-tight"
          style={{ fontFamily: 'Blockletter, Inter, sans-serif' }}
        >
          TECHSKOLAR
        </h1>
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-none tracking-normal uppercase"
          style={{ fontFamily: 'Blockletter, Inter, sans-serif' }}
        >
          NG TAGUIG
        </h2>
      </div>
      <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
    </div>
  );
}
