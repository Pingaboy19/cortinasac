/** @type {import('next').NextConfig} */
const nextConfig = {
  // Las Server Actions ahora están habilitadas por defecto en Next.js 14
  images: {
    domains: ['lh3.googleusercontent.com'], // Permitir imágenes de Google (avatares)
  },
}

module.exports = nextConfig 