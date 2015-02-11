# build-dependencies: flatmaperror, scheduled, filter

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

