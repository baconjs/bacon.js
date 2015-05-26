# build-dependencies: eventstream, event, updatebarrier

Bacon.fromArray = (values) ->
  assertArray values
  if !values.length
    withDesc(new Bacon.Desc(Bacon, "fromArray", values), Bacon.never())
  else
    i = 0
    new EventStream (new Bacon.Desc(Bacon, "fromArray", [values])), (sink) ->
      unsubd = false
      reply = Bacon.more
      pushing = false
      pushNeeded = false
      push = ->
        pushNeeded = true
        if pushing
          return
        pushing = true
        while pushNeeded
          pushNeeded = false
          if (reply != Bacon.noMore) and !unsubd
            value = values[i++]
            reply = sink(toEvent(value))
            if reply != Bacon.noMore
              if i == values.length
                sink(endEvent())
              else
                UpdateBarrier.afterTransaction push
        pushing = false

      push()
      -> unsubd = true
