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
# Some streams are unstable when testing with verifySwitching2.
# Generally, all flatMap-based streams are unstable because flatMap discards
# child streams on unsubscribe.
unstable = {unstable:true}
expectError = (errorText, f) ->
  expect(f).to.throw(Error, errorText)

endlessly = (values...) ->
  index = 0
  Bacon.fromSynchronousGenerator -> new Bacon.Next(-> values[index++ % values.length])

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

toEvent = (x) -> if (x instanceof Bacon.Event) then x else new Bacon.Next(-> x)

fromBinder = Bacon.fromBinder || (binder, eventTransformer = Bacon._.id) ->
  new Bacon.EventStream (sink) ->
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

fromArray = Bacon.fromArray || (values) ->
  assertArray values
  if !values.length
    Bacon.never()
  else
    i = 0
    new Bacon.EventStream (sink) ->
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
isArray = (xs) -> xs instanceof Array

assertArray = (xs) -> throw new Exception("not an array : " + xs) unless isArray(xs)

mergeAll = Bacon.mergeAll || (streams...) ->
  if isArray streams[0]
    streams = streams[0]
  if streams.length
    new Bacon.EventStream (sink) ->
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
      compositeUnsubscribe sinks...
  else
    Bacon.never()
