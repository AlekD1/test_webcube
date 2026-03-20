import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 🌟 ВОТ ЭТА СТРОЧКА ВЕРНЕТ НАМ ПАПКУ OUT
  output: 'export',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;