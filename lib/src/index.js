'use strict';

var fileSize = require('filesize');
var chalk = require('chalk');
var fs = require('fs');
var join = require('path').join;
var merge = require('webpack-merge');
var spawn = require('win-spawn');

exports.printStats = function(stats) {
  var assets = stats.toJson().assets.map(function(asset) {
    return {
      size: fileSize(asset.size),
      name: asset.name
    };
  });
  var longestSize = Math.max.apply(
    null,
    assets.map(function(a) {
      return a.size.length;
    })
  );
  assets.forEach(function(asset) {
    var size = asset.size;
    if (size.length < longestSize) {
      size += ' '.repeat(longestSize - size.length);
    }
    console.log('  ' + size + '  ' + chalk.cyan(asset.name));
  });
};

exports.chartsOption = function(prefix, version) {};

exports.getConfig = function(program) {
  var allConfig = {};
  var pkg = JSON.parse(fs.readFileSync(join(process.cwd(), 'package.json')));
  var isDev = program.env === 'development';
  allConfig.version = pkg.version;
  var config = require(join(process.cwd(), program.config));
  var otherConfig = {dev: {}, qa: {}, prd: {}};
  if (Object.prototype.hasOwnProperty.call(config, 'otherConfig')) {
    otherConfig = config.otherConfig;
    delete config.otherConfig;
  }
  if (config.echarts) {
    allConfig.echarts = config.echarts;
    delete config.echarts;
  }
  var webpackConfig = require(join(__dirname, '../src/webpack/webpack.config.js'))({
    env: program.env,
    prefix: program.prefix,
    title: program.title,
    otherConfig: otherConfig
  });
  webpackConfig = merge(
    webpackConfig,
    require(join(__dirname, '../src/webpack/webpack.config.' + (isDev ? 'dev' : 'prd') + '.js'))
  );
  allConfig.config = merge(webpackConfig, config);
  if (allConfig.echarts) {
    allConfig.option = {
      in: allConfig.echarts.in,
      out: join(allConfig.config.output.path, program.prefix + '/static/js/echarts.min_' + pkg.version + '.js')
    };
  }
  return allConfig;
};

exports.buildCharts = function(option, callback) {
  console.log(chalk.blue('Start build echarts....\n'));
  if (!option.in) {
    throw Error('echarts component index cannot ', echarts.in);
    return;
  }
  var sp = spawn(
    join(process.cwd(), 'node_modules/echarts/build/build.js'),
    ['--min', '-i', option.in, '-o', option.out],
    {stdio: 'inherit', customFds: [0, 1, 2]}
  );
  sp.on('close', function(code) {
    console.log(chalk.blue('Compiled build echarts successfully.\n'));
    callback(code);
  });
};
