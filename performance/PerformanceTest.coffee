Benchmark = require('benchmark')
Bacon = (require "../src/Bacon").Bacon

suite = new Benchmark.Suite

suite.add('Bacon.combineTemplate', ->
  xs = Bacon.fromArray([1,2,3,4,5])
  ys = Bacon.fromArray([1,2,3,4,5])
  Bacon.combineTemplate({a:xs, b:ys})
    .onValue(->)
)
.on('cycle', (event) ->
  console.log(String(event.target));
)
.run({ 'async': false })

