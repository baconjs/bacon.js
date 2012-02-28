Bacon = exports.Bacon = {
  taste : "delicious"
}

Bacon.end = {}

Bacon.later = (delay, value) ->
  new EventStream ((sink) ->
      push = -> 
        sink value
        sink Bacon.end
      setTimeout push delay
  )

Bacon.sequentially = (delay, values) ->
  new EventStream ((sink) ->
      schedule = (xs) -> setTimeout (-> push xs) delay
      push = (xs) -> 
        if empty xs
          sink Bacon.end
        else
          sink (head xs)
          schedule (tail xs)
      schedule values
  )

class EventStream
  constructor: (subscribe) ->
    @subscribe = new Dispatcher(subscribe).subscribe
  filter: (f) ->
    filteredHandler = (event) -> @push event if event == Bacon.end or f event
    new Dispatcher(@subscribe, filteredHandler).toEventStream()
  map: (f) ->
    mappedHandler = (event) -> if event == Bacon.end
                                 @push event
                               else
                                 @push (f event)
    new Dispatcher(@subscribe, mappedHandler).toEventStream()
  toString: -> "EventStream"

class Dispatcher
  constructor: (subscribe, handleEvent) ->
    sinks = []
    @push = (event) =>
      for sink in sinks
        sink event
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
