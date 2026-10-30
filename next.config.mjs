/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes run server-side — keeps OPENAI_API_KEY off the client
  experimental: {},
}

export default nextConfig
