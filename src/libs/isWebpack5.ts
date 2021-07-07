import { NextConfig } from 'next/dist/next-server/server/config';
/**
 * isWebpack5
 *
 * @param nextConfig
 * @returns {boolean}
 */
function isWebpack5 (nextConfig: NextConfig) {
  return (
    typeof nextConfig.webpack.version === 'string' &&
    nextConfig.webpack.version.startsWith('5')
  );
}

export default isWebpack5;
