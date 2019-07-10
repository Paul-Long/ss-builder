#!/usr/bin/env node
'use strict';

const program = require('commander');

program
  .option('-c, --config <config>', 'set webpack config')
  .option('-e, --env <env>', 'NODE_ENV', 'development')
  .action(function(p) {
    p.env = p.env || 'development';
  })
  .parse(process.argv);

require('../scripts/deploy')(program);
