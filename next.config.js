/** @type {import('next').NextConfig} */
// Server Actions left the experimental flag behind in Next 14 and are on by default;
// keeping `experimental.serverActions: true` makes Next 15 reject the config outright
// ("Expected object, received boolean").
const nextConfig = {}

module.exports = nextConfig
