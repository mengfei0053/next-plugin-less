# Next.js + Library Like Antd (with Less)

<!--
[![Build Status][build-img]][build-url]
-->
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard) 
[![Build Status](https://travis-ci.com/mengfei0053/next-plugin-less.svg?branch=release)](https://travis-ci.com/mengfei0053/next-plugin-less) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)




Use Antd Or Library like Antd (with Less) with Next.js. 


If you use nextjs, antd and less, you may use babel-plugin-import to dynamically import less style files in antd. You can use the default configuration of this library.

If you use other libraries with similar structures and also import less style files through babel-plugin-import, then you can also use this library, just customize the configuration `libsStyleRegExp` to exclude server-side compilation styles.


## Usage

```js
module.exports = withLess(
  withMDX({
    /**
     * @default  "/(antd\/.*?\/style).*(?<![.]js)$/"
     * */  
    libsStyleRegExp: /(antd|other-libs)\/.*?\/style.*?/, //  Exclude libs style when compiling server
    cssLoaderOptions: {
      modules: {
        mode: "local",
        auto: (resource) => {
          if (resource.match("node_modules")) {
            return false;
          }
          if (resource.match("src")) {
            return true;
          }
          return false;
        },
      },
    },
  }),
);

```
