
class PropertyDispatcher extends Dispatcher
  constructor: (@property, subscribe, handleEvent) ->
    super(subscribe, handleEvent)
    @current = None
    @currentValueRootId = undefined
    @propertyEnded = false

  push: (event) ->
    if event.isEnd()
      @propertyEnded = true
    if event.hasValue()
      @current = new Some(event)
      @currentValueRootId = UpdateBarrier.currentEventId()
    super(event)

  maybeSubSource: (sink, reply) ->
    if reply == Bacon.noMore
      nop
    else if @propertyEnded
      sink endEvent()
      nop
    else
      Dispatcher::subscribe.call(this, sink)

  subscribe: (sink) =>
    initSent = false
    # init value is "bounced" here because the base Dispatcher class
    # won't add more than one subscription to the underlying observable.
    # without bouncing, the init value would be missing from all new subscribers
    # after the first one
    reply = Bacon.more

    if @current.isDefined and (@hasSubscribers() or @propertyEnded)
      # should bounce init value
      dispatchingId = UpdateBarrier.currentEventId()
      valId = @currentValueRootId
      if !@propertyEnded and valId and dispatchingId and dispatchingId != valId
        # when subscribing while already dispatching a value and this property hasn't been updated yet
        # we cannot bounce before this property is up to date.
        #console.log "bouncing with possibly stale value", event.value(), "root at", valId, "vs", dispatchingId
        UpdateBarrier.whenDoneWith @property, =>
          if @currentValueRootId == valId
            sink initialEvent(@current.get().value())
        # the subscribing thing should be defered
        @maybeSubSource(sink, reply)
      else
        #console.log "bouncing value immediately"
        UpdateBarrier.inTransaction(undefined, this, (->
          reply = sink initialEvent(@current.get().value())
        ), [])
        @maybeSubSource(sink, reply)
    else
      @maybeSubSource(sink, reply)
