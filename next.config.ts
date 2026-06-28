import type { NextConfig } from "next";
import pkg from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  env: {
    appVersion: pkg.version,
  },
};

export default nextConfig;
