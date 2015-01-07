Bacon = (require "../dist/Bacon").Bacon
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


module.exports = { createNObservable, eventStream, title, noop }
