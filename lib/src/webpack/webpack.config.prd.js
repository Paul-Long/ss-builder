'use strict';

var path = require('path');
var CleanPlugin = require('clean-webpack-plugin');

var config = {
  optimization: {
    minimize: true,
    noEmitOnErrors: true,
    concatenateModules: true,
    namedModules: false,
    namedChunks: false,
    flagIncludedChunks: true,
    occurrenceOrder: true,
    sideEffects: true,
    usedExports: true
  },
  plugins: [
    new CleanPlugin(['dist/*', 'build/*.*'], {
      root: path.resolve('.'),
      verbose: true
    })
  ]
};

module.exports = config;
