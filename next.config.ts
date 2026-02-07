import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWA({
  // En Next.js 16+, reactCompiler ya no va dentro de 'experimental'
  reactCompiler: true,

  // Configure Turbopack to avoid conflicts with PWA plugin
  turbopack: {},
});
