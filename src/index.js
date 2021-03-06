'use strict';
const fileSize = require('filesize');
const chalk = require('chalk');
const fs = require('fs');
const join = require('path').join;
const merge = require('webpack-merge');
const spawn = require('win-spawn');

exports.printStats = function(stats) {
  const assets = stats.toJson().assets.map((asset) => {
    return {
      size: fileSize(asset.size),
      name: asset.name
    };
  });
  const longestSize = Math.max.apply(null, assets.map((a) => a.size.length));
  assets.forEach((asset) => {
    let size = asset.size;
    if (size.length < longestSize) {
      size += ' '.repeat(longestSize - size.length);
    }
    console.log('  ' + size + '  ' + chalk.cyan(asset.name));
  });
};

exports.chartsOption = function(prefix, version) {};

exports.getConfig = function(program) {
  const allConfig = {babelImport: [[{libraryName: 'antd', style: true}, 'antd'], [{libraryName: 'lodash'}, 'lodash']]};
  const pkg = JSON.parse(fs.readFileSync(join(process.cwd(), 'package.json')));
  const isDev = program.env === 'development';
  allConfig.version = pkg.version;
  let config = require(join(process.cwd(), program.config));
  let otherConfig = {dev: {}, qa: {}, prd: {}};
  if (Object.prototype.hasOwnProperty.call(config, 'otherConfig')) {
    otherConfig = config.otherConfig;
    delete config.otherConfig;
  }
  if (Object.prototype.hasOwnProperty.call(config, 'babelImport')) {
    allConfig.babelImport = [...allConfig.babelImport, ...config.babelImport];
    delete config.babelImport;
  }
  if (config.echarts) {
    allConfig.echarts = config.echarts;
    delete config.echarts;
  }
  let webpackConfig = require(join(__dirname, '../src/webpack/webpack.config.js'))({
    env: program.env,
    prefix: program.prefix,
    title: program.title,
    otherConfig,
    babelImport: allConfig.babelImport
  });
  webpackConfig = merge(
    webpackConfig,
    require(join(__dirname, `../src/webpack/webpack.config.${isDev ? 'dev' : 'prd'}.js`))
  );
  allConfig.config = merge(webpackConfig, config);
  if (allConfig.echarts) {
    allConfig.option = {
      in: allConfig.echarts.in,
      out: join(allConfig.config.output.path, `${program.prefix}/static/js/echarts.min_${pkg.version}.js`)
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
  const sp = spawn(
    join(process.cwd(), 'node_modules/echarts/build/build.js'),
    ['--min', '-i', option.in, '-o', option.out],
    {stdio: 'inherit', customFds: [0, 1, 2]}
  );
  sp.on('close', function(code) {
    console.log(chalk.blue('Compiled build echarts successfully.\n'));
    callback(code);
  });
};
