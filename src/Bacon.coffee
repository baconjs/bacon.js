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
  constructor: (@subscribe) ->
  filter: (f) ->
    new EventStream @subscribe

class Dispatcher
  constructor: (@_subscribe) ->

empty = (xs) -> xs.length == 0
head = (xs) -> xs[0]
tail = (xs) -> xs[1...xs.length]
