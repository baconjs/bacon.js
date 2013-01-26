Bacon = (require "../src/Bacon").Bacon
_ = Bacon._

timeUnitMillisecs = 10
@t = (time) -> time * timeUnitMillisecs
seqs = []

@error = (msg) -> new Bacon.Error(msg)
@soon = (f) -> setTimeout f, t(1)
@series = (interval, values) ->
  Bacon.sequentially(t(interval), values)
@repeat = (interval, values) ->
  source = Bacon.repeatedly(t(interval), values)
  seqs.push({ values : values, source : source })
  source

@expectStreamEvents = (src, expectedEvents) ->
  runs -> verifySingleSubscriber src(), expectedEvents
  runs -> verifySwitching src(), expectedEvents

@expectPropertyEvents = (src, expectedEvents) ->
  expect(expectedEvents.length > 0).toEqual(true)
  events = []
  events2 = []
  ended = false
  streamEnded = -> ended
  property = src()
  expect(property instanceof Bacon.Property).toEqual(true)
  runs -> property.subscribe (event) -> 
    if event.isEnd()
      ended = true
    else
      events.push(toValue(event))
      if event.hasValue()
        property.subscribe (event) ->
          if event.isInitial()
            events2.push(event.value)
          Bacon.noMore
  waitsFor streamEnded, t(50)
  runs -> 
    expect(events).toEqual(toValues(expectedEvents))
    expect(events2).toEqual(justValues(expectedEvents))
    verifyFinalState(property, lastNonError(expectedEvents))
    verifyCleanup()

verifySingleSubscriber = (src, expectedEvents) ->
  expect(src instanceof Bacon.EventStream).toEqual(true)
  events = []
  ended = false
  streamEnded = -> ended
  runs -> src.subscribe (event) -> 
    if event.isEnd()
      ended = true
    else
      expect(event instanceof Bacon.Initial).toEqual(false)
      events.push(toValue(event))

  waitsFor streamEnded, t(50)
  runs -> 
    expect(events).toEqual(toValues(expectedEvents))
    verifyExhausted(src)
    verifyCleanup()

# get each event with new subscriber
verifySwitching = (src, expectedEvents) ->
  events = []
  ended = false
  streamEnded = -> ended
  newSink = -> 
    (event) ->
      if event.isEnd()
        ended = true
      else
        expect(event instanceof Bacon.Initial).toEqual(false)
        events.push(toValue(event))
        src.subscribe(newSink())
        Bacon.noMore
  runs -> 
    src.subscribe(newSink())
  waitsFor streamEnded, t(50)
  runs -> 
    expect(events).toEqual(toValues(expectedEvents))
    verifyExhausted(src)
    verifyCleanup()

verifyExhausted = (src) ->
  events = []
  src.subscribe (event) ->
    events.push(event)
  expect(events[0].isEnd()).toEqual(true)

lastNonError = (events) ->
  _.last(_.filter(((e) -> toValue(e) != "<error>"), events))

verifyFinalState = (property, value) ->
  events = []
  property.subscribe (event) ->
    events.push(event)
  expect(toValues(events)).toEqual(toValues([value, "<end>"]))

verifyCleanup = @verifyCleanup = ->
  for seq in seqs
    #console.log("verify cleanup: #{seq.values}")
    expect(seq.source.hasSubscribers()).toEqual(false)
  seqs = []

toValues = (xs) ->
  values = []
  for x in xs
    values.push(toValue(x))
  values
toValue = (x) ->
  if x? and x.isEvent?
    if x.isError()
      "<error>"
    else if x.isEnd()
      "<end>"
    else
      x.value
  else
    x

justValues = (xs) ->
  _.filter hasValue, xs
hasValue = (x) ->
  toValue(x) != "<error>"
