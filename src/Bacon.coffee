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
    d = new Dispatcher(@subscribe)
    push = d.push
    d.push = (event) -> push event if event == Bacon.end or f event
    d.toEventStream()

class Dispatcher
  constructor: (subscribe) ->
    sinks = []
    @push = (event) =>
      for sink in sinks
        sink event
    @subscribe = (sink) =>
      sinks.push(sink)
      if sinks.length == 1
        subscribe @push 
  toEventStream: -> new EventStream(@subscribe)

empty = (xs) -> xs.length == 0
head = (xs) -> xs[0]
tail = (xs) -> xs[1...xs.length]
