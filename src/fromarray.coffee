# build-dependencies: eventstream, event, updatebarrier, scheduled

Bacon.fromArray = (values) ->
  withDescription(Bacon, "fromArray", values, Bacon.sequentially(0, values))

Bacon.fromArraySync = (values) ->
  assertArray values
  if !values.length
    withDescription(Bacon, "fromArraySync", values, Bacon.never())
  else
    i = 0
    new EventStream describe(Bacon, "fromArraySync", values), (sink) ->
      unsubd = false
      reply = Bacon.more
      push = ->
        if (reply != Bacon.noMore) and !unsubd
          value = values[i++]
          reply = sink(toEvent(value))
          if reply != Bacon.noMore
            if i == values.length
              sink(endEvent())
            else
              UpdateBarrier.afterTransaction push
      push()
      -> unsubd = true
