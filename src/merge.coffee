# build-dependencies: core
# build-dependencies: compositeunsubscribe

Bacon.EventStream :: merge = (right) ->
  assertEventStream(right)
  left = this
  withDescription(left, "merge", right, Bacon.mergeAll(this, right))

Bacon.mergeAll = (streams...) ->
  if isArray streams[0]
    streams = streams[0]
  if streams.length
    new EventStream describe(Bacon, "mergeAll", streams...), (sink) ->
      ends = 0
      smartSink = (obs) -> (unsubBoth) -> obs.dispatcher.subscribe (event) ->
        if event.isEnd()
          ends++
          if ends == streams.length
            sink endEvent()
          else
            Bacon.more
        else
          reply = sink event
          unsubBoth() if reply == Bacon.noMore
          reply
      sinks = _.map smartSink, streams
      compositeUnsubscribe sinks...
  else
    Bacon.never()
