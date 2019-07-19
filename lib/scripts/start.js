'use strict';

var webpack = require('webpack');
var Server = require('webpack-dev-server');
var chalk = require('chalk');

var _require = require('../src'),
  getConfig = _require.getConfig,
  buildCharts = _require.buildCharts;

exports = module.exports = function(program) {
  var config = getConfig(program);
  if (config.option) {
    buildCharts(config.option, function(code) {});
  }
  var compiler = webpack(config.config);
  var server = new Server(compiler, config.config.devServer);
  server.listen(config.config.devServer.port, 'localhost', function(err) {
    if (err) {
      console.log(chalk.red('webpack-dev-server error'), err);
    }
  });
};
