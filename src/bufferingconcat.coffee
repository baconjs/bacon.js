# build-dependencies: core, eventstream, holdwhen, startwith, map, mapend, merge

Bacon.EventStream :: bufferingConcat = (right) ->
  left = this
  new EventStream describe(left, "bufferingConcat", right), (sink) ->
    bufferedRight = right.holdWhen(left.map(true).startWith(true).mapEnd(false))
    unsubStream = left.merge(bufferedRight).subscribe sink
    -> unsubStream()
