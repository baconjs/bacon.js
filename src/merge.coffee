# build-dependencies: core, argumentstoobservables
# build-dependencies: compositeunsubscribe

Bacon.EventStream :: merge = (right) ->
  assertEventStream(right)
  left = this
  withDesc(new Bacon.Desc(left, "merge", [right]), Bacon.mergeAll(this, right))

Bacon.mergeAll = ->
  streams = argumentsToObservables(arguments)
  if streams.length
    new EventStream (new Bacon.Desc(Bacon, "mergeAll", streams)), (sink) ->
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
      new Bacon.CompositeUnsubscribe(sinks).unsubscribe
  else
    Bacon.never()
