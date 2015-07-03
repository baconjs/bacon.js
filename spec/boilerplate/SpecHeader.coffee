expect = require("chai").expect
Bacon = require("../dist/Bacon").Bacon
_ = Bacon._
Mocks = require( "./Mock")
TickScheduler = require("./TickScheduler").TickScheduler
mock = Mocks.mock
mockFunction = Mocks.mockFunction
EventEmitter = require("events").EventEmitter
sc = TickScheduler()
Bacon.scheduler = sc
expectError = (errorText, f) ->
  expect(f).to.throw(Error, errorText)

endlessly = (values...) ->
  index = 0
  reply = Bacon.more
  fromBinder (sink) ->
    while reply != Bacon.noMore
      reply = sink(new Bacon.Next(-> values[index++ % values.length]))
    -> reply = Bacon.noMore

lessThan = (limit) ->
  (x) -> x < limit
times = (x, y) -> x * y
add = (x, y) -> x + y
id = (x) -> x
activate = (obs) -> 
  obs.onValue(->)
  obs

take = (count, obs) ->
  obs.withHandler (event) ->
    unless event.hasValue()
      @push event
    else
      count--
      if count > 0
        @push event
      else
        @push event if count == 0
        @push new Bacon.End()
        Bacon.noMore

map = (obs, f) ->
  obs.withHandler (event) ->
    @push event.fmap(f)

skip = (count, obs) ->
  obs.withHandler (event) ->
    unless event.hasValue()
      @push event
    else if (count > 0)
      count--
      Bacon.more
    else
      @push event

toEvent = (x) -> if (x instanceof Bacon.Event) then x else new Bacon.Next(-> x)

fromBinder = Bacon.fromBinder || (binder, eventTransformer = Bacon._.id) ->
  new Bacon.EventStream noDesc, (sink) ->
    unbound = false
    shouldUnbind = false
    unbind = ->
      if not unbound
        if unbinder?
          unbinder()
          unbound = true
        else
          shouldUnbind = true
    unbinder = binder (args...) ->
      value = eventTransformer.apply(this, args)
      unless (value instanceof Array) and Bacon._.last(value) instanceof Bacon.Event
        value = [value]
        
      reply = Bacon.more
      for event in value
        reply = sink(event = toEvent(event))
        if reply == Bacon.noMore or event.isEnd()
          # defer if binder calls handler in sync before returning unbinder
          unbind()
          return reply
      reply
    if shouldUnbind
      unbind()
    unbind

fromPoll = Bacon.fromPoll || (delay, poll) ->
  (fromBinder(((handler) ->
    pid = Bacon.scheduler.setInterval(handler, delay)
    -> Bacon.scheduler.clearInterval(pid)), poll))

later = Bacon.later || (delay, value) ->
  fromPoll(delay, -> [value, new Bacon.End()])

sequentially = Bacon.sequentially || (delay, values) ->
  index = 0
  fromPoll delay, ->
    value = values[index++]
    if index < values.length
      value
    else if index == values.length
      [value, new Bacon.End()]
    else
      new Bacon.End()

repeatedly = Bacon.repeatedlly || (delay, values) ->
  index = 0
  fromPoll(delay, -> values[index++ % values.length])

fromArray = Bacon.fromArray || (values) ->
  assertArray values
  if !values.length
    Bacon.never()
  else
    i = 0
    new Bacon.EventStream noDesc, (sink) ->
      unsubd = false
      reply = Bacon.more
      push = ->
        if (reply != Bacon.noMore) and !unsubd
          value = values[i++]
          reply = sink(toEvent(value))
          if reply != Bacon.noMore
            if i == values.length
              sink(new Bacon.End())
            else
              Bacon.UpdateBarrier.afterTransaction push
      push()
      -> unsubd = true

once = Bacon.once || (value) ->
  new Bacon.EventStream noDesc, (sink) ->
    sink (toEvent(value))
    sink (new Bacon.End())
    ->

isArray = (xs) -> xs instanceof Array

assertArray = (xs) -> throw new Exception("not an array : " + xs) unless isArray(xs)

mergeAll = Bacon.mergeAll || (streams...) ->
  if isArray streams[0]
    streams = streams[0]
  if streams.length
    new Bacon.EventStream noDesc, (sink) ->
      ends = 0
      smartSink = (obs) -> (unsubBoth) -> obs.dispatcher.subscribe (event) ->
        if event.isEnd()
          ends++
          if ends == streams.length
            sink new Bacon.End()
          else
            Bacon.more
        else
          reply = sink event
          unsubBoth() if reply == Bacon.noMore
          reply
      sinks = Bacon._.map smartSink, streams
      new Bacon.CompositeUnsubscribe(sinks).unsubscribe
  else
    Bacon.never()

testSideEffects = (wrapper, method) ->
  ->
    it "(f) calls function with property value", ->
      f = mockFunction()
      wrapper("kaboom")[method](f)
      f.verify("kaboom")
    it "(f, param) calls function, partially applied with param", ->
      f = mockFunction()
      wrapper("kaboom")[method](f, "pow")
      f.verify("pow", "kaboom")
    it "('.method') calls event value object method", ->
      value = mock("get")
      value.when().get().thenReturn("pow")
      wrapper(value)[method](".get")
      value.verify().get()
    it "('.method', param) calls event value object method with param", ->
      value = mock("get")
      value.when().get("value").thenReturn("pow")
      wrapper(value)[method](".get", "value")
      value.verify().get("value")
    it "(object, method) calls object method with property value", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow")
      target.verify().pow("kaboom")
    it "(object, method, param) partially applies object method with param", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow", "smack")
      target.verify().pow("smack", "kaboom")
    it "(object, method, param1, param2) partially applies with 2 args", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow", "smack", "whack")
      target.verify().pow("smack", "whack", "kaboom")

t = @t = (time) -> time
seqs = []
noDesc = Bacon.Desc?.empty

verifyCleanup = ->
  for seq in seqs
    expect(seq.source.dispatcher.hasSubscribers()).to.deep.equal(false)
  seqs = []

regSrc = (source) ->
  seqs.push { source }
  source

series = (interval, values) ->
  regSrc sequentially(t(interval), values)

repeat = (interval, values) ->
  regSrc repeatedly(t(interval), values)

error = (msg) -> new Bacon.Error(msg)
soon = (f) -> setTimeout f, t(1)

Array.prototype.extraTest = "Testing how this works with extra fields in Array prototype"
