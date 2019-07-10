'use strict';

const join = require('path').join;
const which = require('which');
const merge = require('webpack-merge');
const webpack = require('webpack');

function runCmd(cmd, args, fn) {
  args = args || [];
  var runner = require('child_process').spawn(cmd, args, {
    // keep color
    stdio: 'inherit'
  });
  runner.on('close', function(code) {
    if (fn) {
      fn(code);
    }
  });
}

exports = module.exports = function(program) {
  console.log('args -> ', program.args, program.config, program.env);
  let config = require(join(process.cwd(), program.config));
  let otherConfig = {dev: {}, qa: {}, prd: {}};
  if (Object.prototype.hasOwnProperty.call(config, 'otherConfig')) {
    otherConfig = config.otherConfig;
    delete config.otherConfig;
  }
  let webpackConfig = require(join(__dirname, '../src/webpack/webpack.config.js'))({
    env: program.env,
    prefix: program.prefix,
    otherConfig
  });
  config = merge(webpackConfig, config);
  config = merge(config, require(join(__dirname, '../src/webpack/webpack.config.prd.js')));
  if (program.analyzer) {
    config.plugins.push(new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin());
  }

  console.log('webpack config -> ', config);
  if (program.env) {
    console.log('node env -> ', program.env);
  }
  const compiler = webpack(webpackConfig);
  const watching = compiler.watch(
    {
      // watchOptions 示例
      aggregateTimeout: 300,
      poll: undefined
    },
    (err, stats) => {
      // 在这里打印 watch/build 结果...
      console.log(stats);
    }
  );
  console.log('---------------------------------------------------');
  program.help();
};
