#!/usr/bin/env node
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
process.env.BABEL_ENV="test";
require("babel-register");
const Benchmark = require('benchmark');
const cases = require("./PerformanceTestCases.coffee");
const suite = new Benchmark.Suite;

for (let key of Object.keys(cases || {})) {
  const value = cases[key];
  suite.add(key, value);
}

suite.on('cycle', event => console.log(String(event.target))).on("error", error => console.log(error)).run({ 'async': false });
