/* eslint-disable */
const webpack = require('webpack');
const resolve = require('path').resolve;
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlStaticBeforePlugin = require('html-static-before-plugin');
const HappyPack = require('happypack');
const HappyThreadPool = HappyPack.ThreadPool({size: require('os').cpus().length});

const node_modules = resolve('./node_modules');
const antTheme = require(resolve(node_modules, 'ss-web-start')).antTheme;
exports = module.exports = function({prefix, otherConfig, title, babelImport}) {
  const asset = `${prefix}/static/`;
  const outputPath = resolve('./dist');
  const isDev = process.env.NODE_ENV === 'development';
  const BUILD_ENV = process.env.BUILD_ENV;
  antTheme['@menu-bg'] = '#193d37';
  antTheme['@menu-dark-submenu-bg'] = '#121A19';
  antTheme['@form-component-max-height'] = 32;
  antTheme['@form-item-margin-bottom'] = 0;
  antTheme['@btn-height-base'] = '24px';
  antTheme['@btn-height-sm'] = '22px';
  antTheme['@input-height-sm'] = '22px';
  antTheme['@collapse-header-bg'] = '#193D37';
  antTheme['@collapse-content-bg'] = '#0A0F0E';
  antTheme['@collapse-header-padding'] = '8px 0 8px 16px';
  antTheme['@collapse-content-padding'] = '0';
  antTheme['@icon-url'] = resolve(node_modules, 'ss-web-start/theme/antd-fonts/iconfont');
  antTheme['@ss-icon-url'] = resolve(node_modules, 'ss-web-start/theme/ss-fonts/iconfont');
  function htmlOption(e) {
    return {
      ...otherConfig[e],
      filename: `index.${e}.html`,
      writeToDisk: true,
      favicon: `/${asset}favicon.ico`
    };
  }

  const config = {
    entry: resolve('./src'),
    output: {
      path: outputPath,
      filename: `${asset}js/[name].[hash:8].js`,
      publicPath: '/',
      globalObject: 'self'
    },
    resolve: {
      // modules: ['node_modules', resolve('./src'), resolve(__dirname, '../node_modules')],
      // extensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.json', '.jsx', '.ts', '.tsx']
    },
    externals: {},
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          enforce: 'pre',
          use: 'happypack/loader?id=js'
        },
        {
          test: /worker\.js$/,
          enforce: 'pre',
          use: {loader: 'worker-loader', options: {name: `${asset}js/fetch-worker.[hash:8].js`}}
        },
        {
          test: /\.(less|css)$/,
          enforce: 'pre',
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: [require('autoprefixer'), require('cssnano')]
              }
            },
            {
              loader: 'less-loader',
              options: {modifyVars: antTheme}
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          enforce: 'pre',
          use: `url-loader?limit=100&name=${asset}images/[name].[hash:8].[ext]`
        },
        {
          test: /\.(ttf|svg|eot|woff)$/,
          enforce: 'pre',
          use: `url-loader?limit=100&name=${asset}fonts/[name].[hash:8].[ext]`
        }
      ]
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new MiniCssExtractPlugin({
        filename: `${asset}css/[name].[hash:8].css`,
        chunkFilename: `${asset}css/[id].[hash:8].css`,
        ignoreOrder: false // Enable to remove warnings about conflicting order
      }),
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
        loaders: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-flow'],
              plugins: [
                '@babel/plugin-proposal-export-default-from',
                '@babel/plugin-proposal-export-namespace-from',
                ['@babel/plugin-proposal-decorators', {legacy: true}],
                ['@babel/plugin-proposal-class-properties', {loose: true}],
                '@babel/plugin-syntax-dynamic-import',
                ...babelImport.map((bi) => ['import', ...bi]),
                ['@babel/plugin-transform-runtime', {regenerator: true}]
              ]
            }
          }
        ],
        verboseWhenProfiling: true
      }),
      new HtmlWebpackPlugin({
        title,
        filename: 'index.html',
        template: resolve(__dirname, 'index.html'),
        inject: true,
        minify: {
          removeComments: false,
          collapseWhitespace: isDev
        }
      }),
      new HtmlStaticBeforePlugin({...otherConfig[BUILD_ENV]}),
      new CopyWebpackPlugin([
        {
          from: resolve(node_modules, 'ss-web-start/theme/'),
          to: resolve(outputPath, `${asset}fonts`),
          ignore: ['*.less', '*.js']
        },
        {
          from: resolve(__dirname, 'favicon.ico'),
          to: resolve(outputPath, asset)
        },
        {
          from: resolve(process.cwd(), 'conf'),
          to: resolve(outputPath, 'conf')
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
  Object.keys(otherConfig || {}).forEach(k => config.plugins.push(new HtmlStaticBeforePlugin(htmlOption(k))));
  config.mode = isDev ? 'development' : 'production';
  config.optimization = {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        base: {
          test: /[\\/]node_modules[\\/](lodash|antd|fast-table|moment|rc-)/,
          chunks: 'all',
          name: 'base',
          priority: 20
        },
        commons: {
          chunks: 'all',
          minChunks: 2,
          name: 'commons',
          maxInitialRequests: 5,
          priority: 10,
          minSize: 0
        }
      }
    }
  };
  return config;
};
