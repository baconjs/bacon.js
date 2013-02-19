Benchmark = require('benchmark')
Bacon = (require "../src/Bacon").Bacon

_ = Bacon._
f = 
  generator: ->
    streams = []
    {
      stream: ->
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
  withGenerator: (fun) ->
    gen = f.generator()
    fun(gen).onValue((v) -> )
    gen.ticks(100)
  combineTemplate: (gen) ->
    Bacon.combineTemplate({a:gen.stream(), b:gen.stream(), c: gen.stream(), d: gen.stream()})

suite = new Benchmark.Suite

suite.add 'Bacon.combineTemplate.sample', ->
  f.withGenerator (gen) ->
    f.combineTemplate(gen)
      .sampledBy(f.everyNth(10, gen.stream())) 
.add 'Bacon.combineTemplate', ->
  f.withGenerator (gen) ->
    f.combineTemplate(gen)
.add 'EventStream.map', ->
  f.withGenerator (gen) ->
    gen.stream().map((x) -> x * 2)
.on 'cycle', (event) ->
  console.log(String(event.target))
.on "error", (error) ->
  console.log(error)
.run({ 'async': false })
