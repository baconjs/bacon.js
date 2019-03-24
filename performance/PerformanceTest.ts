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
