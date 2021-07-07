import type { Configuration } from 'webpack';

/**
* checkIsNextJs
*
* @param webpackConfig
* @returns {boolean}
*/
function checkIsNextJs (webpackConfig:Configuration) {
  return Boolean(
    webpackConfig &&
     webpackConfig.resolveLoader &&
     webpackConfig.resolveLoader.alias &&
     (webpackConfig.resolveLoader.alias as {
       [index: string]: string | false | string[]
     })['next-babel-loader']
  );
}

export default checkIsNextJs;
