import type { Configuration } from 'webpack';
import { overrideWebpackConfig } from './overrideWebpackConfig';

module.exports = (
  pluginOptions = {
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
  webpack (webpackConfig: Configuration, nextConfig:any) {
    return overrideWebpackConfig({
      webpackConfig,
      nextConfig,
      pluginOptions
    });
  }
});
