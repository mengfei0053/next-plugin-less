import { NextConfig } from 'next/dist/next-server/server/config-shared';
import type { Configuration } from 'webpack';
import overrideWebpackConfig from './libs/overrideWebpackConfig';
import { WithLessOptions } from './type';

const withLess = (
  pluginOptions: WithLessOptions = {
    // optional
    modifyVars: undefined,
    // optional
    lessVarsFilePath: undefined,
    // optional
    lessVarsFilePathAppendToEndOfContent: undefined,
    //
    // optional / https://github.com/webpack-contrib/css-loader#object
    cssLoaderOptions: {
      esModule: false,
      sourceMap: false,
      modules: {
        mode: 'local'
      }
    },
    // optional / https://github.com/webpack-contrib/less-loader#options
    lessLoaderOptions: undefined
  }
) => ({
  ...pluginOptions,
  webpack (webpackConfig: Configuration, nextConfig: NextConfig) {
    return overrideWebpackConfig({
      webpackConfig,
      nextConfig,
      pluginOptions
    });
  }
});

export = withLess;
