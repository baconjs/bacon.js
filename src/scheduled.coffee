# build-dependencies: flatmaplatest

Bacon.fromPoll = (delay, poll) ->
  withDescription(Bacon, "fromPoll", delay, poll,
  (Bacon.fromBinder(((handler) ->
    id = Bacon.scheduler.setInterval(handler, delay)
    -> Bacon.scheduler.clearInterval(id)), poll)))

Bacon.later = (delay, value) ->
  withDescription(Bacon, "later", delay, value, Bacon.fromPoll(delay, -> [value, endEvent()]))

Bacon.sequentially = (delay, values) ->
  index = 0
  withDescription(Bacon, "sequentially", delay, values, Bacon.fromPoll delay, ->
    value = values[index++]
    if index < values.length
      value
    else if index == values.length
      [value, endEvent()]
    else
      endEvent())

Bacon.repeatedly = (delay, values) ->
  index = 0
  withDescription(Bacon, "repeatedly", delay, values, Bacon.fromPoll(delay, -> values[index++ % values.length]))

Bacon.interval = (delay, value) ->
  value = {} unless value?
  withDescription(Bacon, "interval", delay, value, Bacon.fromPoll(delay, -> nextEvent(value)))

Bacon.retry = (options) ->
  throw new Exception("'source' option has to be a function") unless _.isFunction(options.source)
  source = options.source
  retries = options.retries or 0
  maxRetries = options.maxRetries or retries
  delay = options.delay or -> 0
  isRetryable = options.isRetryable or -> true

  retry = (context) ->
    nextAttemptOptions = {source, retries: retries - 1, maxRetries, delay, isRetryable}
    delayedRetry = -> Bacon.retry(nextAttemptOptions)
    Bacon.later(delay(context)).filter(false).concat(Bacon.once().flatMap(delayedRetry))

  withDescription(Bacon, "retry", options, source().flatMapError (e) ->
    if isRetryable(e) and retries > 0
      retry({error: e, retriesDone: maxRetries - retries})
    else
      Bacon.once(new Error(e)))

Bacon.EventStream :: delay = (delay) ->
  withDescription(this, "delay", delay, @flatMap (value) ->
    Bacon.later delay, value)

Bacon.Property :: delay = (delay) -> @delayChanges("delay", delay, (changes) -> changes.delay(delay))

Bacon.Property :: delayChanges = (desc..., f) ->
  withDescription(this, desc...,
    addPropertyInitValueToStream(this, f(@changes())))

