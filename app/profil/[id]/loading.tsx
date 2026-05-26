export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-border bg-background" />

      {/* Profile header */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse shrink-0" />

            <div className="flex-1 space-y-3">
              {/* Name + verified badge */}
              <div className="flex items-center gap-3">
                <div className="h-7 w-44 rounded bg-muted animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
              </div>
              {/* Job title */}
              <div className="h-5 w-56 rounded bg-muted animate-pulse" />
              {/* Location + rating row */}
              <div className="flex gap-4 flex-wrap">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              </div>
              {/* Skills tags */}
              <div className="flex gap-2 flex-wrap pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                ))}
              </div>
            </div>

            {/* Contact button */}
            <div className="h-10 w-36 rounded-lg bg-muted animate-pulse shrink-0" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="lg:flex lg:gap-8 lg:items-start">

          {/* Left: bio + services */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Bio */}
            <div className="space-y-2">
              <div className="h-5 w-24 rounded bg-muted animate-pulse mb-4" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            </div>

            {/* Services section */}
            <div>
              <div className="h-5 w-32 rounded bg-muted animate-pulse mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="aspect-video bg-muted animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-full rounded bg-muted animate-pulse" />
                      <div className="flex justify-between items-center pt-1">
                        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: stats */}
          <div className="mt-10 lg:mt-0 lg:w-64 lg:shrink-0 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
