export default function ServiceDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-border bg-background" />

      {/* Hero banner */}
      <div className="h-10 bg-muted animate-pulse" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="lg:flex lg:gap-10 lg:items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Back link + category */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-8 w-1/2 rounded bg-muted animate-pulse" />
            </div>

            {/* Seller row */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>

            {/* Image placeholder */}
            <div className="aspect-video w-full rounded-2xl bg-muted animate-pulse" />

            {/* Description */}
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
              <div className="h-4 w-4/6 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            </div>

            {/* Tags row */}
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-10 lg:mt-0 lg:w-80 lg:shrink-0 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              {/* Tier tabs */}
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 h-8 rounded-md bg-muted-foreground/20 animate-pulse" />
                ))}
              </div>
              {/* Price */}
              <div className="h-9 w-28 rounded bg-muted animate-pulse" />
              {/* Tier description lines */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
              </div>
              {/* Delivery badge */}
              <div className="h-6 w-32 rounded-full bg-muted animate-pulse" />
              {/* CTA button */}
              <div className="h-11 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            </div>

            {/* Seller card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
