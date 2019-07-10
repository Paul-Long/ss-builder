/* eslint-disable */
const webpack = require('webpack');
const resolve = require('path').resolve;
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const LodashPlugin = require('lodash-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlStaticBeforePlugin = require('html-static-before-plugin');
const HappyPack = require('happypack');
const HappyThreadPool = HappyPack.ThreadPool({size: require('os').cpus().length});

const node_modules = resolve('./node_modules');
const antTheme = require(resolve(node_modules, 'ss-web-start')).antTheme;
exports = module.exports = function({prefix, otherConfig}) {
  const asset = `${prefix}/static/`;
  const outputPath = resolve('./dist');
  const isDev = process.env.NODE_ENV === 'development';
  const BUILD_ENV = process.env.BUILD_ENV;
  antTheme['@menu-bg'] = '#193d37';
  antTheme['@menu-dark-submenu-bg'] = '#121A19';
  antTheme['@form-component-max-height'] = 32;
  antTheme['@form-item-margin-bottom'] = 0;
  antTheme['@icon-url'] = resolve(node_modules, 'ss-web-start/theme/antd-fonts/iconfont');
  antTheme['@ss-icon-url'] = resolve(node_modules, 'ss-web-start/theme/ss-fonts/iconfont');

  const config = {
    entry: resolve('./src'),
    output: {
      path: outputPath,
      filename: `${asset}js/[name].[hash:8].js`,
      publicPath: '/',
      globalObject: 'self'
    },
    resolve: {},
    externals: {},
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'happypack/loader?id=js'
        },
        {
          test: /worker\.js$/,
          use: {loader: 'worker-loader', options: {name: `${asset}js/fetch-worker.[hash:8].js`}}
        },
        {
          test: /\.(less|css)$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'css-loader',
              'postcss-loader',
              {
                loader: 'less-loader',
                options: {modifyVars: antTheme}
              }
            ]
          })
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          use: `url-loader?limit=100&name=${asset}images/[name].[hash:8].[ext]`
        },
        {
          test: /\.(ttf|svg|eot|woff)$/,
          use: `url-loader?limit=100&name=${asset}fonts/[name].[hash:8].[ext]`
        }
      ]
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new LodashPlugin(),
      new ExtractTextPlugin({filename: `${asset}css/[name].[hash:8].css`, allChunks: true}),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        'process.env.RUN_ENV': JSON.stringify(BUILD_ENV)
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: !isDev
      }),
      new webpack.HashedModuleIdsPlugin(),
      new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(zh-cn)$/),
      new HappyPack({
        id: 'js',
        threadPool: HappyThreadPool,
        loaders: ['babel-loader'],
        verboseWhenProfiling: true
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: resolve('index.html'),
        inject: true,
        minify: {
          removeComments: false,
          collapseWhitespace: isDev
        }
      }),
      new HtmlStaticBeforePlugin({...otherConfig['dev'], filename: 'index.dev.html', writeToDisk: true}),
      new HtmlStaticBeforePlugin({...otherConfig['qa'], filename: 'index.qa.html', writeToDisk: true}),
      new HtmlStaticBeforePlugin({...otherConfig['prd'], filename: 'index.prd.html', writeToDisk: true}),
      new HtmlStaticBeforePlugin({...otherConfig[BUILD_ENV]}),
      new CopyWebpackPlugin([
        {
          from: resolve(node_modules, 'ss-web-start/theme/'),
          to: resolve(outputPath, `${asset}fonts`),
          ignore: ['*.less', '*.js']
        },
        {
          from: resolve('favicon.ico'),
          to: resolve(outputPath, asset)
        }
      ])
    ],
    node: {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    }
  };
  config.mode = isDev ? 'development' : 'production';
  config.optimization = {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          name: 'commons',
          maxInitialRequests: 5,
          minSize: 0 // 默认是30kb，minSize设置为0之后
          // 多次引用的utility1.js和utility2.js会被压缩到commons中
        },
        base: {
          test: (module) => {
            return /redux|prop-types|lodash|moment|fast-table/.test(module.context);
          },
          chunks: 'initial',
          name: 'base',
          priority: 10
        },
        antd: {
          test: (module) => {
            return /antd/.test(module.context);
          },
          chunks: 'initial',
          name: 'antd',
          priority: 10
        }
      }
    }
  };
  return config;
};
