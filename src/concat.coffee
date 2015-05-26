# build-dependencies: core, eventstream

Bacon.EventStream :: concat = (right) ->
  left = this
  new EventStream (new Bacon.Desc(left, "concat", [right])), (sink) ->
    unsubRight = nop
    unsubLeft = left.dispatcher.subscribe (e) ->
      if e.isEnd()
        unsubRight = right.dispatcher.subscribe sink
      else
        sink(e)
    -> unsubLeft() ; unsubRight()
