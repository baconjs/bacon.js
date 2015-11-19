#!/usr/bin/env coffee
Benchmark = require('benchmark')
cases = require "./PerformanceTestCases.coffee"
suite = new Benchmark.Suite
Bacon = (require "../dist/Bacon").Bacon
_ = Bacon._

includeCase = (key) ->
  args = process.argv.slice(2)
  if args.length
    _.any args, (arg) -> 
      key.toLowerCase().indexOf(arg.toLowerCase()) >= 0
  else
    true

for own key, value of cases
  suite.add key, value if includeCase(key)

suite.on 'cycle', (event) ->
    console.log(String(event.target))
  .on "error", (error) ->
    console.log(error)
  .run({ 'async': false })
