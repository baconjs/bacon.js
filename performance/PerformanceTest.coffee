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
  combineTemplate: (gen, width, depth) ->
    if depth == 0
      gen.stream()
    else
      template = {}
      for i in [1..width]
        template[i] = f.combineTemplate gen, width, depth-1
      Bacon.combineTemplate(template)
  zip: (gen) ->
    gen.stream().zip(gen.stream())

suite = new Benchmark.Suite

suite.add 'zip', ->
  f.withGenerator (gen) ->
    f.zip(gen)
.add 'Bacon.combineTemplate.sample', ->
  f.withGenerator (gen) ->
    f.combineTemplate(gen, 5, 1)
      .sampledBy(f.everyNth(10, gen.stream())) 
.add 'Bacon.combineTemplate (deep)', ->
  f.withGenerator (gen) ->
    f.combineTemplate(gen, 3, 3)
.add 'Bacon.combineTemplate', ->
  f.withGenerator (gen) ->
    f.combineTemplate(gen, 5, 1)
.add 'EventStream.map', ->
  f.withGenerator (gen) ->
    gen.stream().map((x) -> x * 2)
.add 'EventStream.scan', ->
  f.withGenerator (gen) ->
    gen.stream().scan(0, (x,y) -> x+y)
.add 'EventStream.toProperty', ->
  f.withGenerator (gen) ->
    gen.stream().toProperty()
.on 'cycle', (event) ->
  console.log(String(event.target))
.on "error", (error) ->
  console.log(error)
.run({ 'async': false })
