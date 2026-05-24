export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-36 rounded-md bg-muted animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
