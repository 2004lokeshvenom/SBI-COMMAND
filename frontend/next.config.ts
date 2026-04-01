import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller client chunks: import only the icons you use from lucide-react
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Ensures NEXT_PUBLIC_* is available to the client bundle when read from .env
  env: {
    NEXT_PUBLIC_TIMETABLE_TEST_10AM: process.env.NEXT_PUBLIC_TIMETABLE_TEST_10AM ?? "",
    NEXT_PUBLIC_TIMETABLE_TEST_CLOCK: process.env.NEXT_PUBLIC_TIMETABLE_TEST_CLOCK ?? "",
  },
};

export default nextConfig;
