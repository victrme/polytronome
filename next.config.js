const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
})

const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA(
	withBundleAnalyzer({
		pwa: {
			dest: 'public',
			runtimeCaching,
		},
		reactStrictMode: true,
		basePath: '',
	})
)
