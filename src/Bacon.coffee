Bacon = exports.Bacon = {
  taste : "delicious"
}

Bacon.end = "veggies"

Bacon.more = "moar bacon!"

Bacon.later = (delay, value) ->
  new EventStream ((sink) ->
      push = -> 
        sink value
        sink Bacon.end
      setTimeout push delay
  )

Bacon.sequentially = (delay, values) ->
  new EventStream ((sink) ->
      schedule = (xs) -> 
        if empty xs
          sink Bacon.end
        else
          setTimeout (-> push xs) delay
      push = (xs) -> 
        reply = sink (head xs)
        unless reply == Bacon.end
          schedule (tail xs)
      schedule values
  )

class EventStream
  constructor: (subscribe) ->
    @subscribe = new Dispatcher(subscribe).subscribe
  filter: (f) ->
    @withHandler (event) -> @push event if event == Bacon.end or f event
  takeWhile: (f) ->
    @withHandler (event) -> if event == Bacon.end or f event
                              @push event
                            else
                              @push Bacon.end
                              Bacon.end
  map: (f) ->
    @withHandler (event) -> if event == Bacon.end
                                 @push event
                               else
                                 @push (f event)
  merge: (other) -> this

  withHandler: (handler) ->
    new Dispatcher(@subscribe, handler).toEventStream()
  toString: -> "EventStream"

class Dispatcher
  constructor: (subscribe, handleEvent) ->
    sinks = []
    @push = (event) =>
      for sink in sinks
        reply = sink event
        remove(sink, sinks) if reply == Bacon.end
      if (sinks.length > 0) then Bacon.more else Bacon.end
    handleEvent ?= (event) -> @push event
    @handleEvent = (event) => handleEvent.apply(this, [event])
    @subscribe = (sink) =>
      sinks.push(sink)
      if sinks.length == 1
        subscribe @handleEvent
  toEventStream: -> new EventStream(@subscribe)
  toString: -> "Dispatcher"

empty = (xs) -> xs.length == 0
head = (xs) -> xs[0]
tail = (xs) -> xs[1...xs.length]
remove = (x, xs) ->
  i = xs.indexOf(x)
  if i >= 0
    xs.splice(i, 1)
