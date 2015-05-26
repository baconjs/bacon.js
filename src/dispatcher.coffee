# build-dependencies: _
# build-dependencies: updatebarrier

class Dispatcher
  pushing: false,
  ended: false,
  prevError: undefined,
  unsubSrc: undefined,

  constructor: (@_subscribe, @_handleEvent) ->
    @subscriptions = []
    @queue = []

  hasSubscribers: ->
    @subscriptions.length > 0

  removeSub: (subscription) ->
    @subscriptions = _.without(subscription, @subscriptions)

  push: (event) ->
    if event.isEnd()
      @ended = true
    UpdateBarrier.inTransaction event, this, @pushIt, [event]

  pushToSubscriptions: (event) ->
    try
      tmp = @subscriptions
      for sub in tmp
        reply = sub.sink event
        @removeSub sub if reply == Bacon.noMore or event.isEnd()
      true
    catch e
      @pushing = false
      @queue = [] # ditch queue in case of exception to avoid unexpected behavior
      throw e

  pushIt: (event) ->
    unless @pushing
      return if event == @prevError
      @prevError = event if event.isError()
      @pushing = true
      @pushToSubscriptions(event)
      @pushing = false
      while @queue.length
        event = @queue.shift()
        @push event
      if @hasSubscribers()
        Bacon.more
      else
        @unsubscribeFromSource()
        Bacon.noMore
    else
      @queue.push(event)
      Bacon.more

  handleEvent: (event) =>
    if @_handleEvent
      @_handleEvent(event)
    else
      @push event

  unsubscribeFromSource: ->
    @unsubSrc() if @unsubSrc
    @unsubSrc = undefined

  subscribe: (sink) =>
    if @ended
      sink endEvent()
      nop
    else
      assertFunction sink
      subscription = { sink: sink }
      @subscriptions.push(subscription)
      if @subscriptions.length == 1
        @unsubSrc = @_subscribe @handleEvent
        assertFunction @unsubSrc
      =>
        @removeSub subscription
        @unsubscribeFromSource() unless @hasSubscribers()

Bacon.Dispatcher = Dispatcher
