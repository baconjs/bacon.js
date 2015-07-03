# Some streams are (semi)unstable when testing with verifySwitching2.
# Generally, all flatMap-based streams are at least semi-unstable because flatMap discards
# child streams on unsubscribe.
#
# semiunstable=events may be lost if subscribers are removed altogether between events
# unstable=events may be inconsistent for subscribers that are added between events

unstable = {unstable:true, semiunstable:true}
semiunstable = {semiunstable:true}

atGivenTimes = (timesAndValues) ->
  startTime = Bacon.scheduler.now()
  fromBinder (sink) ->
    shouldStop = false
    schedule = (timeOffset, index) ->
      first = timesAndValues[index]
      scheduledTime = first[0]
      delay = scheduledTime - Bacon.scheduler.now() + startTime
      push = ->
        return if shouldStop
        value = first[1]
        sink(new Bacon.Next(-> value))
        if !shouldStop && (index+1 < timesAndValues.length)
          schedule(scheduledTime, index+1)
        else
          sink(new Bacon.End())
      Bacon.scheduler.setTimeout push, delay
    schedule(0, 0)
    ->
      shouldStop = true


browser = (typeof window == "object")
if browser
  console.log("Running in browser, narrowing test set")

expectStreamTimings = (src, expectedEventsAndTimings, options) ->
  srcWithRelativeTime = () ->
    now = Bacon.scheduler.now
    t0 = now()
    relativeTime = () ->
      Math.floor(now() - t0)
    withRelativeTime = (x) -> [relativeTime(), x]
    src().withHandler (e) ->
      e = e.fmap(withRelativeTime)
      e.value?() # force eval
      @push e
  expectStreamEvents(srcWithRelativeTime, expectedEventsAndTimings, options)

expectStreamEvents = (src, expectedEvents, {unstable, semiunstable} = {}) ->
  verifySingleSubscriber src, expectedEvents
  verifyLateEval src, expectedEvents
  if not unstable
    verifySwitching src, expectedEvents unless browser
    verifySwitchingWithUnsub src, expectedEvents unless browser
  if not (unstable or semiunstable)
    verifySwitchingAggressively src, expectedEvents

expectPropertyEvents = (src, expectedEvents, {unstable, semiunstable, extraCheck} = {}) ->
  expect(expectedEvents.length > 0).to.deep.equal(true, "at least one expected event is specified")
  verifyPSingleSubscriber src, expectedEvents, extraCheck
  verifyPLateEval src, expectedEvents
  if not unstable
    verifyPIntermittentSubscriber src, expectedEvents
    verifyPSwitching src, justValues(expectedEvents)
  if not (unstable or semiunstable)
    verifyPSwitchingAggressively src, justValues(expectedEvents)

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

verifyPIntermittentSubscriber = (srcF, expectedEvents) ->
  verifyPropertyWith "(with intermittent subscriber)", srcF, expectedEvents, (src, events, done) ->
    take(1, src).subscribe(->)
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

verifyPSwitchingAggressively = (srcF, expectedEvents, done) ->
  describe "(switching aggressively)", ->
    src = null
    events = []
    idCounter = 0
    before -> src = srcF()
    before (done) ->
      unsub = null
      newSink = ->
        myId = ++idCounter
        #console.log "new sub", myId
        unsub = null
        gotMine = false
        (event) ->
          #console.log "at", Bacon.scheduler.now(), "got", event, "for", myId
          if event.isEnd() and myId == idCounter
            done()
          else if event.hasValue()
            if gotMine
              #console.log "  -> ditch it"
              if unsub?
                unsub()
              unsub = src.subscribe(newSink())
              Bacon.noMore
            else
              #console.log "  -> take it"
              gotMine = true
              events.push(toValue(event))
      unsub = src.subscribe(newSink())
    it "outputs expected value in order", ->
      expect(events).to.deep.equal(toValues(expectedEvents))

verifyPropertyWith = (description, srcF, expectedEvents, collectF, extraCheck) ->
  describe description, ->
    src = null
    events = []
    before -> 
      src = srcF()
    before (done) ->
      collectF(src, events, done)
    it "is a Property", ->
      expect(src instanceof Bacon.Property).to.deep.equal(true)
    it "outputs expected events in order", ->
      expect(toValues(events)).to.deep.equal(toValues(expectedEvents))
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
        expect(event instanceof Bacon.Initial).to.deep.equal(false, "no Initial events")
        events.push(event)


verifySingleSubscriber = (srcF, expectedEvents) ->
  verifyStreamWith "(single subscriber)", srcF, expectedEvents, (src, events, done) ->
    src.subscribe (event) -> 
      if event.isEnd()
        done()
      else
        expect(event instanceof Bacon.Initial).to.deep.equal(false, "no Initial events")
        events.push(toValue(event))

# get each event with new subscriber
verifySwitching = (srcF, expectedEvents, done) ->
  verifyStreamWith "(switching subscribers)", srcF, expectedEvents, (src, events, done) ->
    newSink = -> 
      (event) ->
        if event.isEnd()
          done()
        else
          expect(event instanceof Bacon.Initial).to.deep.equal(false, "no Initial events")
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
            expect(event instanceof Bacon.Initial).to.deep.equal(false, "no Initial events")
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
      expect(src instanceof Bacon.EventStream).to.equal(true, "is an EventStream")
    before (done) ->
      collectF(src, events, done)
    it "outputs expected value in order", ->
      expect(toValues(events)).to.deep.equal(toValues(expectedEvents))
    it "the stream is exhausted", ->
       verifyExhausted src
    it "cleans up observers", verifyCleanup

verifySwitchingAggressively = (srcF, expectedEvents, done) ->
  describe "(switching aggressively)", ->
    src = null
    events = []
    unsub = null
    before ->
      src = srcF()
      expect(src instanceof Bacon.EventStream).to.equal(true, "is an EventStream")
    before (done) ->
      newSink = ->
        unsub = null
        (event) ->
          if event.isEnd()
            done()
          else
            expect(event instanceof Bacon.Initial).to.deep.equal(false, "no Initial events")
            events.push(toValue(event))
            if unsub?
              unsub()
            unsub = src.subscribe(newSink())
            Bacon.noMore
      unsub = src.subscribe(newSink())
    it "outputs expected value in order", ->
      expect(events).to.deep.equal(toValues(expectedEvents))
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
  expect(events[0].isEnd()).to.deep.equal(true)

lastNonError = (events) ->
  Bacon._.last(Bacon._.filter(((e) -> toValue(e) != "<error>"), events))

verifyFinalState = (property, value) ->
  events = []
  property.subscribe (event) ->
    events.push(event)
  expect(toValues(events)).to.deep.equal(toValues([value, "<end>"]))

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
  Bacon._.filter hasValue, xs

hasValue = (x) ->
  toValue(x) != "<error>"

Bacon.Observable?.prototype.onUnsub = (f) ->
  self = this
  ended = false
  return new Bacon.EventStream noDesc, (sink) ->
    unsub = self.subscribe sink
    ->
      f()
      unsub()
