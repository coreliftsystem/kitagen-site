import type { NextConfig } from "next";

const BACKEND_URL = process.env.MENU_API_BASE_URL ?? "";

function getRemotePatterns(): {
  protocol: "https" | "http";
  hostname: string;
  port?: string;
  pathname?: string;
}[] {
  if (!BACKEND_URL) return [];

  try {
    const url = new URL(BACKEND_URL);

    return [
      {
        protocol: url.protocol.replace(":", "") as "https" | "http",
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/**", // ← これが重要（全パス許可）
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getRemotePatterns(),
  },
};

export default nextConfig;
