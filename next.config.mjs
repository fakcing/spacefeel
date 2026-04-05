import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: config => {
		config.infrastructureLogging = { level: 'error' }
		return config
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'image.tmdb.org',
				pathname: '/t/p/**',
			},
			{
				protocol: 'https',
				hostname: 'img.youtube.com',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'anilibria.top',
			},
			{
				protocol: 'https',
				hostname: 'static.yani.tv',
			},
		],
		formats: ['image/webp'],
		minimumCacheTTL: 604800,
		deviceSizes: [640, 828, 1080, 1200, 1920],
		imageSizes: [64, 128, 180, 256, 342],
	},
	experimental: {
		optimisticClientCache: true,
	},
}

export default withNextIntl(nextConfig)
