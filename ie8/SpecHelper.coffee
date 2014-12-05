assert = require("assertive-chai").assert
Bacon = (require "../src/Bacon").Bacon
_ = Bacon._

t = @t = (time) -> time
seqs = []
waitMs = 100

browser = (typeof window == "object")
if browser
  console.log("Running in browser, narrowing test set")

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

@expectStreamTimings = (src, expectedEventsAndTimings, options) ->
  srcWithRelativeTime = () ->
    now = Bacon.scheduler.now
    t0 = now()
    relativeTime = () -> 
      Math.floor(now() - t0)
    withRelativeTime = (x) -> [relativeTime(), x]
    src().flatMap(withRelativeTime)
  @expectStreamEvents(srcWithRelativeTime, expectedEventsAndTimings, options)

@expectStreamEvents = (src, expectedEvents, {unstable} = {}) ->
  verifySingleSubscriber src, expectedEvents
  verifyLateEval src, expectedEvents
  if not unstable
    verifySwitching src, expectedEvents unless browser
    verifySwitchingWithUnsub src, expectedEvents unless browser
    verifySwitchingAggressively src, expectedEvents

@expectPropertyEvents = (src, expectedEvents, {unstable, extraCheck} = {}) ->
  assert.deepEqual expectedEvents.length > 0, true, "at least one expected event is specified"
  verifyPSingleSubscriber src, expectedEvents, extraCheck
  verifyPLateEval src, expectedEvents
  if not unstable
    verifyPSwitching src, justValues(expectedEvents)

verifyPSingleSubscriber = (srcF, expectedEvents, extraCheck) ->
  verifyPropertyWith "(single subscriber)", srcF, expectedEvents, ((src, events, done) ->
    gotInitial = false
    gotNext = false
    sync = true
    src.subscribe (event) ->
      if event.isEnd()
        done()
      else
        if event.isInitial()
          if gotInitial then done(new Error "got more than one Initial event: " + toValue(event))
          if gotNext then done(new Error "got Initial event after the Next one: " + toValue(event))
          unless sync then done(new Error "got async Initial event: " + toValue(event))
          gotInitial = true
        else if event.hasValue()
          gotNext = true
        events.push(toValue(event))
    sync = false
  ), extraCheck

verifyPLateEval = (srcF, expectedEvents) ->
  verifyPropertyWith "(late eval)", srcF, expectedEvents, (src, events, done) ->
    src.subscribe (event) -> 
      if event.isEnd()
        done()
      else
        events.push(event)

verifyPSwitching = (srcF, expectedEvents) ->
  verifyPropertyWith "(switching subscribers)", srcF, expectedEvents, (src, events, done) ->
    src.subscribe (event) -> 
      if event.isEnd()
        done()
      else
        if event.hasValue()
          src.subscribe (event) ->
            if event.isInitial()
              events.push(event.value())
            Bacon.noMore

verifyPropertyWith = (description, srcF, expectedEvents, collectF, extraCheck) ->
  describe description, ->
    src = null
    events = []
    before -> 
      src = srcF()
    before (done) ->
      collectF(src, events, done)
    it "is a Property", ->
      assert.deepEqual src instanceof Bacon.Property, true
    it "outputs expected events in order", ->
      assert.deepEqual toValues(events), toValues(expectedEvents)
    it "has correct final state", ->
      verifyFinalState(src, lastNonError(expectedEvents))
    it "cleans up observers", verifyCleanup
    if (extraCheck)
      extraCheck()

verifyLateEval = (srcF, expectedEvents) ->
  verifyStreamWith "(late eval)", srcF, expectedEvents, (src, events, done) ->
    src.subscribe (event) -> 
      if event.isEnd()
        done()
      else
        assert.deepEqual event instanceof Bacon.Initial, false, "no Initial events"
        events.push(event)


verifySingleSubscriber = (srcF, expectedEvents) ->
  verifyStreamWith "(single subscriber)", srcF, expectedEvents, (src, events, done) ->
    src.subscribe (event) -> 
      if event.isEnd()
        done()
      else
        assert.deepEqual event instanceof Bacon.Initial, false, "no Initial events"
        events.push(toValue(event))

# get each event with new subscriber
verifySwitching = (srcF, expectedEvents, done) ->
  verifyStreamWith "(switching subscribers)", srcF, expectedEvents, (src, events, done) ->
    newSink = -> 
      (event) ->
        if event.isEnd()
          done()
        else
          assert.deepEqual event instanceof Bacon.Initial, false, "no Initial events"
          events.push(toValue(event))
          src.subscribe(newSink())
          Bacon.noMore
    src.subscribe(newSink())

# get each event with new subscriber. Unsub using the unsub function
# instead of Bacon.noMore
verifySwitchingWithUnsub = (srcF, expectedEvents, done) ->
  verifyStreamWith "(switching subscribers with unsub)", srcF, expectedEvents, (src, events, done) ->
    globalEnded = false
    subNext = ->
      unsub = null
      newSink = -> 
        ended = false
        noMoreExpected = false
        usedUnsub = false
        (event) ->
          if noMoreExpected
            console.log "got unexp", event.toString(), "usedUnsub", usedUnsub
          if event.isEnd()
            if ended
              console.log("one stream, two ends")
            else if globalEnded
              console.log("two ends")
            globalEnded = true
            ended = true
            done()
          else
            assert.deepEqual event instanceof Bacon.Initial, false, "no Initial events"
            events.push(toValue(event))
            prevUnsub = unsub
            noMoreExpected = true
            subNext()
            if unsub?
              usedUnsub = true
              unsub()
            else
              Bacon.noMore
      unsub = src.subscribe(newSink())
    subNext()

verifyStreamWith = (description, srcF, expectedEvents, collectF) ->
  describe description, ->
    src = null
    events = []
    before -> 
      src = srcF()
      assert.equal src instanceof Bacon.EventStream, true, "is an EventStream"
    before (done) ->
      collectF(src, events, done)
    it "outputs expected value in order", ->
      assert.deepEqual toValues(events), toValues(expectedEvents)
    it "the stream is exhausted", ->
       verifyExhausted src
    it "cleans up observers", verifyCleanup

verifySwitchingAggressively = (srcF, expectedEvents, done) ->
  describe "(switching aggressively)", ->
    src = null
    events = []
    before -> 
      src = srcF()
      assert.equal src instanceof Bacon.EventStream, true, "is an EventStream"
    before (done) ->
      newSink = -> 
        unsub = null
        (event) ->
          if event.isEnd()
            done()
          else
            assert.deepEqual event instanceof Bacon.Initial, false, "no Initial events"
            events.push(toValue(event))
            unsub() if unsub?
            unsub = src.subscribe(newSink())
            Bacon.noMore
      unsub = src.subscribe(newSink())
    it "outputs expected value in order", ->
      assert.deepEqual events, toValues(expectedEvents)
    it "the stream is exhausted", ->
       verifyExhausted src
    it "cleans up observers", verifyCleanup

verifyExhausted = (src) ->
  events = []
  src.subscribe (event) ->
    if (event == undefined)
      throw new Error("got undefined event")
    events.push(event)
  if (events.length == 0)
    throw new Error("got zero events")
  assert.deepEqual events[0].isEnd(), true

lastNonError = (events) ->
  _.last(_.filter(((e) -> toValue(e) != "<error>"), events))

verifyFinalState = (property, value) ->
  events = []
  property.subscribe (event) ->
    events.push(event)
  assert.deepEqual toValues(events), toValues([value, "<end>"])

verifyCleanup = @verifyCleanup = ->
  for seq in seqs
    assert.deepEqual seq.source.dispatcher.hasSubscribers(), false
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

