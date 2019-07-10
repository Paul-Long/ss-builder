#!/usr/bin/env node
'use strict';

const program = require('commander');
const spawn = require('win-spawn');
const join = require('path').join;
const exists = require('fs').existsSync;

function printHelp() {
  console.log('  Commands:');
  console.log();
  console.log('    deploy         deploy package');
  console.log('    start          start app');
  console.log();
  console.log('  All commands can be run with -h (or --help) for more information.');
}

program
  .usage('<command> [options]')
  .on('--help', printHelp)
  .parse(process.argv);

const args = process.argv.slice(3);
let subcmd = program.args[0];

console.log(args, subcmd);

function wrap(sp) {
  sp.on('close', function(code) {
    process.exit(code);
  });
}

function executable(subcmd) {
  var file = join(__dirname, subcmd + '.js');
  if (exists(file)) {
    return file;
  }
}

if (!subcmd) {
  program.help();
} else {
  const bin = executable(subcmd);
  if (bin) {
    console.log(bin);
    wrap(spawn(bin, args, {stdio: 'inherit', customFds: [0, 1, 2]}));
  } else {
    program.help();
  }
}
