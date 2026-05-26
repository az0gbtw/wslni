"use client"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#FAFAF8",
          color: "#1A1A1A",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
          {/* Icon */}
          <div
            style={{
              margin: "0 auto 1.5rem",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Logo */}
          <p
            style={{
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              marginBottom: "1rem",
            }}
          >
            <span style={{ color: "#DC2626" }}>W</span>slni
          </p>

          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Une erreur critique est survenue
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "#6B7280",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Quelque chose s&apos;est mal passé. Nos équipes ont été notifiées.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                backgroundColor: "#DC2626",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                padding: "12px 24px",
                border: "none",
                cursor: "pointer",
                width: "100%",
                maxWidth: "220px",
                transition: "background-color 150ms",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#B91C1C")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#DC2626")
              }
            >
              Réessayer
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                color: "#1A1A1A",
                fontSize: "14px",
                fontWeight: 600,
                padding: "12px 24px",
                textDecoration: "none",
                width: "100%",
                maxWidth: "220px",
              }}
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
