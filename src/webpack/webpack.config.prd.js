const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

const config = {
  optimization: {
    minimize: true,
    noEmitOnErrors: true,
    concatenateModules: true
  },
  plugins: [
    new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin(),
    new CleanPlugin(['dist/*', 'build/*.*'], {
      root: path.resolve('./dist'),
      verbose: true,
      exclude: ['echarts.min_2.0.0.js']
    })
  ]
};

module.exports = config;
