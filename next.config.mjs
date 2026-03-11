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
			// Добавляем домен для аватарок Google
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			// Добавляем домен для аватарок GitHub (на будущее)
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			// AniLibria posters
			{
				protocol: 'https',
				hostname: 'anilibria.tv',
			},
		],
		formats: ['image/avif', 'image/webp'],
		minimumCacheTTL: 86400,
		deviceSizes: [640, 828, 1080, 1200, 1920],
		imageSizes: [64, 128, 180, 256, 342, 384],
	},
	experimental: {
		optimisticClientCache: true,
	},
}

export default withNextIntl(nextConfig)
