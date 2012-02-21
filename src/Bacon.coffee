Bacon = exports.Bacon = {
  taste : "delicious"
}

Bacon.end = {}

Bacon.later = (delay, value) ->
  { subscribe : (sink) ->
      push = -> 
        sink value
        sink Bacon.end
      setTimeout push delay
  }

Bacon.sequentially = (delay, values) ->
  { subscribe : (sink) ->
      push = (xs) -> 
        sink (head xs)
        if empty xs
          sink Bacon.end
        else
          Bacon.sequentially(delay, tail values)
      setTimeout (-> push values) delay
  }

empty = (xs) -> xs.length == 0
head = (xs) -> xs[0]
tail = (xs) -> xs[1...xs.length]
