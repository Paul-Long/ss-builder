'use strict';

var join = require('path').join;

var _require = require('../src'),
  buildCharts = _require.buildCharts;

exports = module.exports = function(program) {
  var option = {
    in: join(process.cwd(), program.in),
    out: join(process.cwd(), program.out)
  };
  buildCharts(option, function(code) {
    process.exit(code);
  });
};
