Bacon = (require "../dist/Bacon").Bacon
{noop, createNObservable, eventStream, title} = require "./MemTestHelper"

title "new EventStream"
createNObservable 700, eventStream

title "new Bus()"
createNObservable 700, -> new Bacon.Bus()


title "Bacon.once(1)"
createNObservable 700, (i) ->
  Bacon.once(i)

title "Bacon.never()"
createNObservable 700, ->
  Bacon.never()

title "EventStream::toProperty(1)"
createNObservable 700, ->
  eventStream().toProperty(1)

title "EventStream::toProperty(1).changes()"
createNObservable 700, ->
  eventStream().toProperty(1).changes()

title "EventStream::map(noop)"
createNObservable 700, ->
  eventStream().map(noop)

title "EventStream::filter(noop)"
createNObservable 700, ->
  eventStream().filter(noop)

title "EventStream::scan(0, noop)"
createNObservable 700, ->
  eventStream().scan(0, noop)

title "Bacon.sequentially(0, [1, 2])"
createNObservable 700, ->
  Bacon.sequentially(0, [1, 2])

title "EventStream::take(5)"
createNObservable 700, ->
  eventStream().take(5)

title "EventStream::flatMap(noop)"
createNObservable 700, ->
  eventStream().flatMap(noop)

title "EventStream::combine(stream, noop)"
createNObservable 700, ->
  eventStream().combine(eventStream(), noop)

title "EventStream::combineAsArray(stream1, stream2, stream3, stream4)"
createNObservable 500, ->
  Bacon.combineAsArray(eventStream(), eventStream(), eventStream(), eventStream())

title "EventStream::mergeAll(stream1, stream2, stream3, stream4)"
createNObservable 500, ->
  Bacon.mergeAll(eventStream(), eventStream(), eventStream(), eventStream())

diamond = (src, width, depth) ->
  if depth == 0
    src
  else
    branches = (diamond(src.map(->), width, depth-1) for s in [1..width])
    Bacon.combineAsArray branches

title "Diamond-shaped Property graph"
createNObservable 100, ->
  diamond(eventStream(), 3, 5)

combineTemplate = (gen, width, depth) ->
  if depth == 0
    gen()
  else
    template = {}
    for i in [1..width]
      template[i] = combineTemplate gen, width, depth-1
    Bacon.combineTemplate(template)

title "Bacon.combineTemplate"
createNObservable 100, ->
  combineTemplate(eventStream, 4, 4)
