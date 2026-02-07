import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/config'],
  output: "standalone",
};

export default nextConfig;
