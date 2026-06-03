export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar placeholder */}
      <div className="h-16 border-b border-border bg-background" />

      {/* Hero skeleton */}
      <div className="bg-muted/40 px-4 py-24 flex flex-col items-center gap-6">
        <div className="h-12 w-2/3 max-w-lg rounded-lg bg-muted animate-pulse" />
        <div className="h-6 w-1/2 max-w-sm rounded bg-muted animate-pulse" />
        <div className="h-12 w-full max-w-md rounded-full bg-muted animate-pulse" />
        <div className="flex gap-6 mt-2">
          <div className="h-5 w-28 rounded bg-muted animate-pulse" />
          <div className="h-5 w-28 rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Categories skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-7 w-48 rounded bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>

      {/* Featured freelancers skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-7 w-56 rounded bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-full rounded bg-muted animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
