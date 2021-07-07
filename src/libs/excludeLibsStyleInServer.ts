import { NextConfig } from 'next/dist/next-server/server/config';
import type { Configuration } from 'webpack';
import isWebpack5 from './isWebpack5';

/**
 * excludeLibsStyleInServer
 * @param webpackConfig
 * @param nextConfig
 * @returns {*}
 */
export default function excludeLibsStyleInServer (webpackConfig: Configuration, nextConfig: NextConfig, libReg?: RegExp) {
  if (!nextConfig.isServer) return webpackConfig;

  const LIBS_STYLE_REGEXP = libReg || /(antd\/.*?\/style).*(?<![.]js)$/;
  const exts = [...webpackConfig.externals as any];

  webpackConfig.externals = isWebpack5(nextConfig)
    ? [
      // ctx and cb are both webpack5's params
      // ctx eqauls { context, request, contextInfo, getResolve }
      // https://webpack.js.org/configuration/externals/#function
        (ctx, cb) => {
          if (ctx.request && ctx.request.match(LIBS_STYLE_REGEXP)) return cb();

          // next's params are different when webpack5 enable
          // https://github.com/vercel/next.js/blob/0425763ed6a90f4ff99ab2ff37821da61d895e09/packages/next/build/webpack-config.ts#L770
          if (typeof exts[0] === 'function') return exts[0](ctx, cb);
          return cb();
        },
        ...(typeof exts[0] === 'function' ? [] : exts)
      ]
    : [
      // webpack4
        (ctx: any, req: any, cb: any) => {
          if (req.match(LIBS_STYLE_REGEXP)) return cb();

          if (typeof exts[0] === 'function') return exts[0](ctx, req, cb);
          return cb();
        },
        ...(typeof exts[0] === 'function' ? [] : exts)
      ];

  ((webpackConfig.module as any).rules as any[]).unshift({
    test: LIBS_STYLE_REGEXP,
    use: 'null-loader'
  });

  return webpackConfig;
}
