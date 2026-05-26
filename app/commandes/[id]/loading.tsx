export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-border bg-background" />

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Back link */}
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />

        {/* Order header card */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-6 w-2/3 rounded bg-muted animate-pulse" />
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-7 w-24 rounded-full bg-muted animate-pulse shrink-0" />
          </div>

          {/* Buyer / Seller row */}
          <div className="flex gap-6 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Price + date */}
          <div className="flex gap-8 pt-1">
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>

        {/* Messages section */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Messages header */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          </div>

          {/* Message bubbles */}
          <div className="p-6 space-y-4 min-h-[300px]">
            {[
              { align: "start", width: "55%" },
              { align: "end",   width: "45%" },
              { align: "start", width: "65%" },
              { align: "end",   width: "40%" },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.align === "end" ? "justify-end" : "justify-start"}`}>
                <div
                  className="h-12 rounded-2xl bg-muted animate-pulse"
                  style={{ width: m.width }}
                />
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="px-6 py-4 border-t border-border flex gap-3 items-center">
            <div className="flex-1 h-10 rounded-lg bg-muted animate-pulse" />
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
