# build-dependencies: EventStream
#
class Bus extends EventStream
  constructor: ->
    @sink = undefined
    @subscriptions = []
    @ended = false
    super(describe(Bacon, "Bus"), @subscribeAll)

  unsubAll: =>
    sub.unsub?() for sub in @subscriptions
    undefined

  subscribeAll: (newSink) =>
    @sink = newSink
    for subscription in cloneArray(@subscriptions)
      @subscribeInput(subscription)
    @unsubAll

  guardedSink: (input) => (event) =>
    if (event.isEnd())
      @unsubscribeInput(input)
      Bacon.noMore
    else
      @sink event

  subscribeInput: (subscription) ->
    subscription.unsub = (subscription.input.dispatcher.subscribe(@guardedSink(subscription.input)))

  unsubscribeInput: (input) ->
    for sub, i in @subscriptions
      if sub.input == input
        sub.unsub?()
        @subscriptions.splice(i, 1)
        return

  plug: (input) ->
    assertObservable input
    return if @ended
    sub = { input: input }
    @subscriptions.push(sub)
    @subscribeInput(sub) if (@sink?)
    => @unsubscribeInput(input)

  end: ->
    @ended = true
    @unsubAll()
    @sink? endEvent()

  push: (value) ->
    @sink? nextEvent(value)

  error: (error) ->
    @sink? new Error(error)

Bacon.Bus = Bus
