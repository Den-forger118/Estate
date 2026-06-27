import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// ─── Content Security Policy ─────────────────────────────────────────────────
// 'unsafe-inline' on script-src and style-src is required by Next.js App Router:
// it injects inline hydration scripts and Tailwind writes inline style attributes.
// Upgrade path: add a nonce via middleware and switch to 'nonce-<value>' — see
// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
//
// frame-src allows:
//   maps.google.com / www.google.com — MapEmbed component (contact + property pages)
// Paystack checkout is a full-page redirect (window.location.href), not an iframe,
// so no Paystack entry is needed here.
//
// img-src includes images.unsplash.com because several components use raw <img>
// tags with full Unsplash URLs (Cards, Heroes, etc.) rather than Next/Image proxy.
const cspDirectives = [
  "default-src 'self'",
  // React dev mode uses eval() to reconstruct call stacks; never needed in production.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://maps.google.com https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Prevent this page from being embedded in a frame (legacy browsers use this;
  // modern browsers use frame-ancestors from the CSP above).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing a response away from the declared Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin (no path/query) in the Referer header when navigating
  // to a different origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features this app doesn't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Content-Security-Policy", value: cspDirectives },
  // HSTS: tell browsers to only access this site over HTTPS for 2 years.
  // Applied in production only — setting it over plain HTTP in dev would lock
  // localhost into HTTPS unexpectedly.
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.4"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
