expect = require("chai").expect
Bacon = (require "../src/Bacon").Bacon
_ = Bacon._

t = @t = (time) -> time
seqs = []
waitMs = 100

grep = process.env.grep
if grep
  console.log("running with grep:", grep)
  origDescribe = describe
  match = false
  global.describe = (desc, f) ->
    if desc.indexOf(grep) >= 0
      match = true
      origDescribe(desc, f)
      match = false
    else if match
      origDescribe(desc, f)

@error = (msg) -> new Bacon.Error(msg)
@soon = (f) -> setTimeout f, t(1)
@series = (interval, values) ->
  Bacon.sequentially(t(interval), values)
@repeat = (interval, values) ->
  source = Bacon.repeatedly(t(interval), values)
  seqs.push({ values : values, source : source })
  source
@atGivenTimes = (timesAndValues) ->
  streams = for tv in timesAndValues
    Bacon.later(t(tv[0]), tv[1])
  Bacon.mergeAll(streams)

@expectStreamTimings = (src, expectedEventsAndTimings) ->
  srcWithRelativeTime = () ->
    now = Bacon.scheduler.now
    t0 = now()
    relativeTime = () -> 
      Math.floor(now() - t0)
    withRelativeTime = (x) -> [relativeTime(), x]
    src().map(withRelativeTime)
  @expectStreamEvents(srcWithRelativeTime, expectedEventsAndTimings)

@expectStreamEvents = (src, expectedEvents) ->
  verifySingleSubscriber src, expectedEvents
  verifySwitching src, expectedEvents

@expectPropertyEvents = (src, expectedEvents) ->
  expect(expectedEvents.length > 0).to.deep.equal(true)
  property = null
  events = []
  events2 = []
  streamEnded = -> ended
  before ->
    property = src()
  before (done) ->
    property.subscribe (event) -> 
      if event.isEnd()
        done()
      else
        events.push(toValue(event))
        if event.hasValue()
          property.subscribe (event) ->
            if event.isInitial()
              events2.push(event.value())
            Bacon.noMore
  it "is a Property", ->
    expect(property instanceof Bacon.Property).to.deep.equal(true)
  it "outputs expected events in order", ->
    expect(events).to.deep.equal(toValues(expectedEvents))
  it "outputs expected events in order when subscribing after each value", ->
    expect(events2).to.deep.equal(justValues(expectedEvents))
  it "has correct final state", ->
    verifyFinalState(property, lastNonError(expectedEvents))
  it "cleans up observers", verifyCleanup

verifySingleSubscriber = (srcF, expectedEvents) ->
  verifyStreamWith "(single subscriber)", srcF, expectedEvents, (src, events, done) ->
    src.subscribe (event) -> 
      if event.isEnd()
        done()
      else
        expect(event instanceof Bacon.Initial).to.deep.equal(false)
        events.push(toValue(event))

# get each event with new subscriber
verifySwitching = (srcF, expectedEvents, done) ->
  verifyStreamWith "(switching subscribers)", srcF, expectedEvents, (src, events, done) ->
    newSink = -> 
      (event) ->
        if event.isEnd()
          done()
        else
          expect(event instanceof Bacon.Initial).to.deep.equal(false)
          events.push(toValue(event))
          src.subscribe(newSink())
          Bacon.noMore
    src.subscribe(newSink())

verifyStreamWith = (description, srcF, expectedEvents, collectF) ->
  describe description, ->
    src = null
    events = []
    before -> 
      src = srcF()
      expect(src instanceof Bacon.EventStream).to.equal(true)
    before (done) ->
      collectF(src, events, done)
    it "outputs expected value in order", ->
      expect(events).to.deep.equal(toValues(expectedEvents))
    it "the stream is exhausted", ->
       verifyExhausted src
    it "cleans up observers", verifyCleanup

verifyExhausted = (src) ->
  events = []
  src.subscribe (event) ->
    events.push(event)
  expect(events[0].isEnd()).to.deep.equal(true)

lastNonError = (events) ->
  _.last(_.filter(((e) -> toValue(e) != "<error>"), events))

verifyFinalState = (property, value) ->
  events = []
  property.subscribe (event) ->
    events.push(event)
  expect(toValues(events)).to.deep.equal(toValues([value, "<end>"]))

verifyCleanup = @verifyCleanup = ->
  for seq in seqs
    expect(seq.source.hasSubscribers()).to.deep.equal(false)
  seqs = []

toValues = (xs) ->
  values = []
  for x in xs
    values.push(toValue(x))
  values
toValue = (x) ->
  switch true
    when !x?.isEvent?() then x
    when x.isError() then "<error>"
    when x.isEnd() then "<end>"
    else x.value()

justValues = (xs) ->
  _.filter hasValue, xs
hasValue = (x) ->
  toValue(x) != "<error>"

@toValues = toValues

Bacon.Observable.prototype.onUnsub = (f) ->
  self = this;
  ended = false
  return new Bacon.EventStream (sink) ->
    unsub = self.subscribe sink
    -> 
      f()
      unsub()
