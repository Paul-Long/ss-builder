'use strict';

var webpack = require('webpack');
var chalk = require('chalk');

var _require = require('../src'),
  printStats = _require.printStats,
  getConfig = _require.getConfig,
  buildCharts = _require.buildCharts;

exports = module.exports = function(program) {
  var config = getConfig(program);
  if (program.analyzer) {
    config.config.plugins.push(new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin());
  }
  var compiler = webpack(config.config);
  function done(err, stats) {
    if (err) {
      process.stdout.write(err + '\n');
    } else {
      printStats(stats);
    }
    console.log(chalk.green('Compiled successfully.\n'));

    if (config.option) {
      buildCharts(config.option, function(code) {
        process.exit(code);
      });
    }
  }
  compiler.run(done);
};
