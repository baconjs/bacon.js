#!/usr/bin/env coffee
Benchmark = require('benchmark')
Bacon = (require "../dist/Bacon").Bacon

_ = Bacon._

class Generator
  constructor: ->
    @streams = []
    @counters = []

  stream: ->
    bus = new Bacon.Bus()
    @streams.push(bus)
    @counters.push(0)
    bus

  ticks: (count) ->
    for i in [1..count]
      for s, j in @streams
        counter = @counters[j] += 1
        s.push(counter)
    null

f =
  generator: -> new Generator()
  everyNth: (n, stream) ->
    stream.filter (x) -> x % n == 0
  withGenerator: (fun, rounds=100) ->
    gen = f.generator()
    fun(gen).onValue((v) -> )
    gen.ticks(rounds)
  combineTemplate: (gen, width, depth) ->
    if depth == 0
      gen.stream()
    else
      template = {}
      for i in [1..width]
        template[i] = f.combineTemplate gen, width, depth - 1
      Bacon.combineTemplate(template)
  diamond: (src, width, depth) ->
    if depth == 0
      src
    else
      branches = (f.diamond(src.map(->), width, depth - 1) for s in [1..width])
      Bacon.combineAsArray branches

  zip: (gen) ->
    gen.stream().zip(gen.stream())

suite = new Benchmark.Suite

cases = {
  'diamond': ->
    f.withGenerator(((gen) ->
      s = f.diamond(gen.stream(), 3, 5)
      s.onValue ->
      s
    ),1)
  'combo': ->
    f.withGenerator(((gen) ->
      s = f.combineTemplate(gen, 4, 4)
      s.onValue ->
      s), 1)
  'zip': ->
    f.withGenerator (gen) ->
      f.zip(gen)
  'Creating streams': ->
    Bacon.once()
  'EventStream passthrough': ->
    f.withGenerator (gen) ->
      gen.stream()
  'EventStream.map': ->
    f.withGenerator (gen) ->
      gen.stream().map((x) -> x * 2)
  'EventStream.flatMap': ->
    f.withGenerator (gen) ->
      gen.stream().flatMap (x) ->
        Bacon.once(x * 2)
  'Bacon.combineTemplate.sample': ->
    f.withGenerator (gen) ->
      f.combineTemplate(gen, 5, 1)
        .sampledBy(f.everyNth(10, gen.stream()))
  'Bacon.combineTemplate (deep)': ->
    f.withGenerator (gen) ->
      f.combineTemplate(gen, 3, 3)
  'Bacon.combineTemplate': ->
    f.withGenerator (gen) ->
      f.combineTemplate(gen, 5, 1)
  'EventStream.scan': ->
    f.withGenerator (gen) ->
      gen.stream().scan(0, (x,y) -> x+y)
  'EventStream.toProperty': ->
    f.withGenerator (gen) ->
      gen.stream().toProperty()
  'EventStream.holdWhen': ->
    f.withGenerator (gen) ->
      gen.stream().holdWhen(gen.stream().map(false))
}

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
