class CompositeUnsubscribe
  constructor: (ss = []) ->
    @unsubscribed = false
    @subscriptions = []
    @starting = []
    @add s for s in ss
  add: (subscription) ->
    return if @unsubscribed
    ended = false
    unsub = nop
    @starting.push subscription
    unsubMe = =>
      return if @unsubscribed
      ended = true
      @remove unsub
      _.remove subscription, @starting
    unsub = subscription @unsubscribe, unsubMe
    unless (@unsubscribed or ended)
      @subscriptions.push unsub
    else
      unsub()
    _.remove subscription, @starting
    unsub
  remove: (unsub) ->
    return if @unsubscribed
    unsub() if (_.remove unsub, @subscriptions) != undefined
  unsubscribe: =>
    return if @unsubscribed
    @unsubscribed = true
    s() for s in @subscriptions
    @subscriptions = []
    @starting = []
  count: ->
    return 0 if @unsubscribed
    @subscriptions.length + @starting.length
  empty: ->
    @count() == 0

Bacon.CompositeUnsubscribe = CompositeUnsubscribe
