#!/usr/bin/env node
'use strict';

const program = require('commander');

program
  .option('-c, --config <config>', 'webpack config')
  .option('-e, --env <env>', 'NODE_ENV', 'production')
  .option('-p, --prefix <prefix>', 'app url prefix')
  .option('-a, --analyzer', 'webpack analyzer')
  .action(function(p) {
    p.env = p.env || 'production';
    if (!p.prefix) {
      throw Error(`args prefix cannot ${p.prefix}`);
    }
    if (!p.config) {
      throw Error(`args prefix cannot ${p.config}`);
    }
  })
  .parse(process.argv);
require('../scripts/deploy')(program);
