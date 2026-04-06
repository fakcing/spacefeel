import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: config => {
		config.infrastructureLogging = { level: 'error' }
		return config
	},
	images: {
		unoptimized: true,
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
	},
	experimental: {
		optimisticClientCache: true,
	},
}

export default withNextIntl(nextConfig)
