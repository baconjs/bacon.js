# build-dependencies: flatmap, later, filter, repeat, endonerror, once, concat

Bacon.retry = (options) ->
  throw new Exception("'source' option has to be a function") unless _.isFunction(options.source)
  source = options.source
  retries = options.retries or 0
  maxRetries = options.maxRetries or retries
  delay = options.delay or -> 0
  isRetryable = options.isRetryable or -> true

  finished = false
  error = null
  withDesc new Bacon.Desc(Bacon, "retry", [options]), Bacon.repeat ->
    if finished
      null # end it
    else
      valueStream = -> source().endOnError().withHandler (event) ->
        if event.isError()
          error = event
          if isRetryable(error.error) and retries > 0
            # will retry
          else
            finished = true # no more retries
            @push event # push final error to subscriber
        else
          if event.hasValue()
            error = null
            finished = true
          @push event
      if error
        # retrying
        context = { error: error.error, retriesDone: maxRetries - retries }
        pause = Bacon.later(delay(context)).filter(false)
        retries = retries - 1
        pause.concat(Bacon.once().flatMap(valueStream))
      else
        # first time
        valueStream()
