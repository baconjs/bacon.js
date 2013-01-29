Benchmark = require('benchmark')
Bacon = (require "../src/Bacon").Bacon

_ = Bacon._
f = 
  generator: ->
    streams = []
    {
      make: ->
        counter = 0
        bus = new Bacon.Bus()
        bus.tick = -> @push(counter = counter + 1)
        streams.push(bus)
        bus
      tick: ->
        s.tick() for s in streams
      ticks: (count) ->
        @tick() for i in [1..count]
    }
  everyNth: (n, stream) ->
    stream.filter (x) -> x % n == 0

suite = new Benchmark.Suite

suite.add 'Bacon.combineTemplate.sample', ->
  gen = f.generator()
  Bacon.combineTemplate({a:gen.make(), b:gen.make(), c: gen.make(), d: gen.make()})
    .sampledBy(f.everyNth(10, gen.make())) 
    .onValue((v) -> )
  gen.ticks(100)
.on 'cycle', (event) ->
  console.log(String(event.target))
.on "error", (error) ->
  console.log(error)
.run({ 'async': false })

