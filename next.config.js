/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
    webpack(config) {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'windyimage.s3.ap-northeast-1.amazonaws.com',
            }
        ]
    }
};

module.exports = nextConfig;
