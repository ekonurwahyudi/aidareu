import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  // App Router (src/app) sudah diaktifkan secara default di Next.js 15
  experimental: {
    // appDir: true, // Hapus ini karena tidak valid lagi
  }
  // Anda bisa menggunakan Pages Router (pages) bersamaan dengan App Router
  // pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
