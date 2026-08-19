/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Driver database di-require runtime (bukan di-bundle webpack).
  // Mencegah error "Module not found: Can't resolve 'pg'/'mysql2'" saat build,
  // terutama bila hanya sebagian driver terpasang di server.
  serverExternalPackages: ["pg", "mysql2", "@neondatabase/serverless"],
};

export default nextConfig;
