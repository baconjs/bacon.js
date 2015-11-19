#!/usr/bin/env coffee
Benchmark = require('benchmark')
cases = require "./PerformanceTestCases.coffee"
suite = new Benchmark.Suite

for own key, value of cases
  suite.add key, value

suite.on 'cycle', (event) ->
    console.log(String(event.target))
  .on "error", (error) ->
    console.log(error)
  .run({ 'async': false })
