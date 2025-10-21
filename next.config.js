/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Suprimir avisos de hidratação causados por extensões do navegador
    suppressHydrationWarning: true,
  },
  // Configurações adicionais para evitar problemas de hidratação
  compiler: {
    // Remover console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configurações de webpack para melhor compatibilidade
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
