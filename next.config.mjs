import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Driver database di-require runtime (bukan di-bundle webpack).
  serverExternalPackages: ["pg", "mysql2", "@neondatabase/serverless"],
  // Paksa alias @/ -> src (jaga-jaga bila resolusi tsconfig paths gagal di server/CloudLinux).
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.join(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
