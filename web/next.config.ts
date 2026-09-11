import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontido: .next/standalone roda com `node server.js`, sem node_modules na VM.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // As imagens já vêm nos tamanhos certos do admin PHP (/img e /uploads são servidos
  // pelo nginx direto do webroot). Sem otimização = sem dependência do sharp na VM.
  images: { unoptimized: true },
};

export default nextConfig;
