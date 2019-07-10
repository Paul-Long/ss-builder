const webpack = require('webpack');

const config = {
  devtool: 'inline-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()]
};

module.exports = config;
