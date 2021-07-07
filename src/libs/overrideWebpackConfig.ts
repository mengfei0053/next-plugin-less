import clone from 'clone';
import fs from 'fs';
import path from 'path';
import checkIsNextJs from './checkIsNextJs';
import handleAntdInServer from './handleAntdInServer';

/**
 * overrideWebpackConfig
 *
 * @param webpackConfig
 * @param nextConfig
 * @param pluginOptions
 * @returns {*}
 */
export default function overrideWebpackConfig ({ webpackConfig, nextConfig, pluginOptions }:any) {
  const isNextJs = checkIsNextJs(webpackConfig);

  if (isNextJs && !nextConfig.defaultLoaders) {
    throw new Error(
      // eslint-disable-next-line max-len
      'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
    );
  }

  // eslint-disable-next-line no-underscore-dangle
  let __DEV__: boolean | undefined;
  if (isNextJs) __DEV__ = nextConfig.dev;
  else __DEV__ = webpackConfig.mode !== 'production';

  const { rules } = webpackConfig.module;

  // compatible w/ webpack 4 and 5
  const ruleIndex = (rules as any).findIndex((rule:any) => Array.isArray(rule.oneOf));
  const rule = rules[ruleIndex];

  // default localIdentName
  let localIdentName = __DEV__ ? '[local]--[hash:4]' : '[hash:8]';

  if (
    pluginOptions &&
      pluginOptions.cssLoaderOptions &&
      pluginOptions.cssLoaderOptions.modules &&
      pluginOptions.cssLoaderOptions.modules.localIdentName
  ) {
    localIdentName = pluginOptions.cssLoaderOptions.modules.localIdentName;
  }

  //
  //
  //
  // ---- cssModule ----
  //
  // delete default `getLocalIdent` and set `localIdentName`
  const cssModuleRegx = '/\\.module\\.css$/';
  const cssModuleIndex = rule.oneOf.findIndex(
    (item:any) => `${item.test}` === cssModuleRegx
  );
  const cssModule = rule.oneOf[cssModuleIndex];
  const cssLoaderInCssModule = cssModule.use.find((item:any) => `${item.loader}`.includes('css-loader'));

  if (pluginOptions.cssLoaderOptions) {
    cssLoaderInCssModule.options = {
      ...cssLoaderInCssModule.options,
      ...pluginOptions.cssLoaderOptions
    };
  }

  if (
    pluginOptions.cssLoaderOptions &&
      pluginOptions.cssLoaderOptions.modules
  ) {
    cssLoaderInCssModule.options.modules = {
      ...cssLoaderInCssModule.options.modules,
      ...pluginOptions.cssLoaderOptions.modules
    };
  }

  //
  //
  //
  // ---- lessModule (from the sassModule clone) ----
  //
  // find
  const sassModuleRegx = '/\\.module\\.(scss|sass)$/';
  const sassModuleIndex = rule.oneOf.findIndex(
    (item:any) => `${item.test}` === sassModuleRegx
  );
  const sassModule = rule.oneOf[sassModuleIndex];

  // clone
  const lessModule = clone(sassModule);
  lessModule.test = /\.less$/;
  delete lessModule.issuer;

  // overwrite
  const lessModuleIndex = lessModule.use.findIndex((item:any) => `${item.loader}`.includes('sass-loader'));

  // merge lessModule options
  const lessModuleOptions = {
    lessOptions: {
      javascriptEnabled: true
    },
    ...pluginOptions.lessLoaderOptions
  };

  //
  //
  //
  // ---- file-loader supported *.less ----
  //
  // url()s fail to load files
  // https://github.com/SolidZORO/next-plugin-antd-less/issues/39
  //
  // find
  const fileModuleIndex = rule.oneOf.findIndex((item:any) => {
    if (
      item.use &&
        item.use.loader &&
        item.use.loader.includes('/file-loader/')
    ) {
      return item;
    }
    return null;
  });

  const fileModule = rule.oneOf[fileModuleIndex];

  if (fileModule) {
    // RAW ---> issuer: /\.(css|scss|sass)$/,
    fileModule.issuer = /\.(css|scss|sass|less)$/;
  }

  /*
    |--------------------------------------------------------------------------
    | modifyVars (Hot Reload is **NOT Supported**, NEED restart webpack)
    |--------------------------------------------------------------------------
    |
    | CONSTANTS --> e.g. `@THEME--DARK: 'theme-dark';`
    |                    `:global(.@{THEME--DARK}) { color: red }`
    |
    */
  let modifyVars;

  if (pluginOptions.modifyVars) {
    modifyVars = pluginOptions.modifyVars;
  }

  if (pluginOptions.modifyVars) {
    lessModuleOptions.lessOptions.modifyVars = modifyVars;
  }

  /*
    |--------------------------------------------------------------------------
    | lessVarsFilePath (Hot Reload is **Supported**, can overwrite `antd` vars)
    |--------------------------------------------------------------------------
    |
    | variables file --> e.g. `./styles/variables.less`
    |                         `@primary-color: #04f;`
    |
    */
  if (pluginOptions.lessVarsFilePath) {
    lessModuleOptions.additionalData = (content:any) => {
      const lessVarsFileResolvePath = path.resolve(
        pluginOptions.lessVarsFilePath
      );

      if (fs.existsSync(lessVarsFileResolvePath)) {
        const importLessLine = `@import '${lessVarsFileResolvePath}';`;

        // https://github.com/SolidZORO/next-plugin-antd-less/issues/40
        if (pluginOptions.lessVarsFilePathAppendToEndOfContent) {
          content = `${content}\n\n${importLessLine};`;
        } else {
          content = `${importLessLine};\n\n${content}`;
        }

        // console.log(content);
      }

      return content;
    };
  }

  // console.log('🟡  lessModuleOptions', '\n');
  // console.dir(lessModuleOptions, { depth: null });

  lessModule.use.splice(lessModuleIndex, 1, {
    // https://github.com/webpack-contrib/less-loader#options
    loader: 'less-loader',
    options: lessModuleOptions
  });

  //
  //
  //
  // ---- cssLoader In LessModule ----

  // find
  const cssLoaderInLessModuleIndex = lessModule.use.findIndex((item:any) => `${item.loader}`.includes('css-loader'));
  const cssLoaderInLessModule = lessModule.use.find((item:any) => `${item.loader}`.includes('css-loader'));

  // clone
  const cssLoaderClone = clone(cssLoaderInLessModule);

  if (
    cssLoaderClone &&
      cssLoaderClone.options &&
      cssLoaderClone.options.modules &&
      cssLoaderClone.options.modules.getLocalIdent
  ) {
    // make the custom `localIdentName` work
    delete cssLoaderClone.options.modules.getLocalIdent;
  }

  // merge CssModule options
  cssLoaderClone.options = {
    ...cssLoaderClone.options,
    sourceMap: Boolean(__DEV__),
    ...pluginOptions.cssLoaderOptions,
    //
    modules: {
      localIdentName,
      // Inherited from Raw NextJs cssModule
      ...cssLoaderClone.options.modules,
      //
      // if enable `local` mode, you can write this less
      //
      // ```styles.module.less
      // .abc {      <---- is local, match class='abc--nx3xc2'
      //   color: red;
      //
      //   :global {
      //     .xyz {  <---- is global, match class='xyz'
      //       color: blue;
      //     }
      //   }
      // }
      //
      mode: 'local', // local, global, and pure, next.js default is `pure`
      //
      // Inherited from pluginOptions
      ...(pluginOptions.cssLoaderOptions || {}).modules,
      //
      // recommended to keep `true`!
      auto: true
    }
  };

  // console.log('🟢  cssModuleOptions', '\n');
  // console.dir(cssLoaderClone.options, { depth: null });

  // overwrite
  lessModule.use.splice(cssLoaderInLessModuleIndex, 1, cssLoaderClone);

  //
  //
  //
  // ---- append lessModule to webpack modules ----
  rule.oneOf.splice(sassModuleIndex, 0, lessModule);
  webpackConfig.module.rules[ruleIndex] = rule;

  //
  //
  // ---- handleAntdInServer (ONLY Next.js) ----
  if (isNextJs) {
    webpackConfig = handleAntdInServer(webpackConfig, nextConfig);

    if (typeof pluginOptions.webpack === 'function') {
      return pluginOptions.webpack(webpackConfig, nextConfig);
    }
  }

  // console.log('🟣  webpackConfig.module.rules');
  // console.dir(webpackConfig.module.rules, { depth: null });

  return webpackConfig;
}
