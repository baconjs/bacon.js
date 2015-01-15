# build-dependencies: core

Bacon.EventStream :: concat = (right) ->
  left = this
  new EventStream describe(left, "concat", right), (sink) ->
    unsubRight = nop
    unsubLeft = left.dispatcher.subscribe (e) ->
      if e.isEnd()
        unsubRight = right.dispatcher.subscribe sink
      else
        sink(e)
    -> unsubLeft() ; unsubRight()
