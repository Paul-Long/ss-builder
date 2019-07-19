'use strict';

const webpack = require('webpack');
const chalk = require('chalk');
const {printStats, getConfig, buildCharts} = require('../src');

exports = module.exports = function(program) {
  const config = getConfig(program);
  if (program.analyzer) {
    config.config.plugins.push(new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin());
  }
  const compiler = webpack(config.config);
  function done(err, stats) {
    if (err) {
      process.stdout.write(err + '\n');
    } else {
      printStats(stats);
      process.stdout.write(stats.toString() + '\n');
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
