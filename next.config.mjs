const ContentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' required by Next.js App Router (hydration scripts);
  // 'unsafe-eval' required by Next.js dev-mode HMR / source maps
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // 'unsafe-inline' required for Tailwind / Next.js injected styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  // wss: for Supabase Realtime; va.vercel-insights.com for Vercel Analytics
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-insights.com",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.100.16"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
        ],
      },
    ]
  },
}

export default nextConfig
