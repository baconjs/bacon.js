Bacon = (require "../src/Bacon").Bacon
toKb = (x) -> (x / 1024).toFixed(2) + ' KiB'
toMb = (x) -> (x / 1024 / 1024).toFixed(2) + ' MiB'

byteFormat = (bytes, comparison) ->
  if Math.abs(comparison || bytes) > 512 * 1024
    toMb(bytes)
  else
    toKb(bytes)

lpad = (string, length = 12) ->
  while(string.length < length)
    string = " #{string}"
  string

rpad = (string, length = 12) ->
  while(string.length < length)
    string = "#{string} "
  string
measure = (fun) ->
  global.gc()
  lastMemoryUsage = process.memoryUsage().heapUsed
  startTime = Date.now()
  fun()
  duration = Date.now() - startTime
  global.gc()
  [process.memoryUsage().heapUsed - lastMemoryUsage, duration]

sum = (xs) -> xs.reduce (sum, x) -> sum + x
mean = (xs) -> sum(xs) / xs.length
stddev = (xs) ->
  avg = mean(xs)
  Math.pow(mean(Math.pow((x - avg), 2) for x in xs), 0.5)

processResults = (results, i) ->
  values = (x[i] for x in results)

  mean: mean(values[2..])
  stddev: stddev(values[2..])

printResult = (label, result, forcePrefix = false) ->
  prefix = if prefix && result.mean > 0 then '+' else ''
  console.log("  #{rpad(label, 20)}", lpad(prefix + byteFormat(result.mean), 12), '\u00b1', byteFormat(result.stddev, result.mean))
createNObservable = (count, generator) ->
  n = Math.floor(count / 10)
  m = 10

  results = for i in [0...m]
    global.gc()
    objects = new Array(n) # Preallocate array of n elements
    unsubscribers = new Array(n)
    subscribe = ->
      for i in [0...objects.length]
        unsubscribers[i] = objects[i].onValue(noop)
    unsubscribe = ->
      for i in [0...objects.length]
        unsubscribers[i]()
        unsubscribers[i] = null

    global.gc()
    withoutSubscriber = measure ->
      objects[i] = generator(i) for i in [0...objects.length]

    withSubscriber = measure subscribe
    afterCleanup = measure unsubscribe
    reSubscribe = measure subscribe
    afterReCleanup = measure unsubscribe

    objects = null
    unsubscribers = null
    [withoutSubscriber[0]/n, withSubscriber[0]/n, afterCleanup[0]/n, reSubscribe[0]/n, afterReCleanup[0]/n]

  withoutSubscriber = processResults(results, 0)
  withSubscriber = processResults(results, 1)
  afterCleanup = processResults(results, 2)
  reSubscribe = processResults(results, 3)
  afterReCleanup = processResults(results, 4)

  printResult('w/o subscription', withoutSubscriber)
  printResult('with subscription', withSubscriber, true)
  printResult('unsubscribe', afterCleanup, true)
  printResult('subscribe again', reSubscribe, true)
  printResult('unsubscribe again', afterReCleanup, true)

title = (text) -> console.log('\n' + text)
noop = ->


# Keep reference to listeners during test run
fakeSource =
  listeners: []
  subscribe: (listener) -> @listeners.push(listener)
  unsubscribe: (listener) ->
    index = @listeners.indexOf(listener)
    @listeners.splice(index, 1) if index != -1


eventStream = ->
  new Bacon.EventStream (sink) ->
    fakeSource.subscribe(sink)
    -> fakeSource.unsubscribe(sink)

diamond = (src, width, depth) ->
  if depth == 0
    src
  else
    branches = (diamond(src.map(->), width, depth-1) for s in [1..width])
    Bacon.combineAsArray branches

combineTemplate = (gen, width, depth) ->
  if depth == 0
    gen()
  else
    template = {}
    for i in [1..width]
      template[i] = combineTemplate gen, width, depth-1
    Bacon.combineTemplate(template)

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

title "Diamond-shaped Property graph"
createNObservable 100, ->
  diamond(eventStream(), 3, 5)

title "Bacon.combineTemplate"
createNObservable 100, ->
  combineTemplate(eventStream, 4, 4)
