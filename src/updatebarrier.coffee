# build-dependencies: _

UpdateBarrier = Bacon.UpdateBarrier = (->
  rootEvent = undefined
  waiterObs = []
  waiters = {}
  afters = []
  aftersIndex = 0

  afterTransaction = (f) ->
    if rootEvent
      afters.push(f)
    else
      f()

  whenDoneWith = (obs, f) ->
    if rootEvent
      obsWaiters = waiters[obs.id]
      if !obsWaiters?
        obsWaiters = waiters[obs.id] = [f]
        waiterObs.push(obs)
      else
        obsWaiters.push(f)
    else
      f()

  flush = ->
    while waiterObs.length > 0
      flushWaiters(0)
    undefined

  flushWaiters = (index) ->
    obs = waiterObs[index]
    obsId = obs.id
    obsWaiters = waiters[obsId]
    waiterObs.splice(index, 1)
    delete waiters[obsId]
    flushDepsOf(obs)
    for f in obsWaiters
      f()
    undefined

  flushDepsOf = (obs) ->
    deps = obs.internalDeps()
    for dep in deps
      flushDepsOf(dep)
      if waiters[dep.id]
        index = _.indexOf(waiterObs, dep)
        flushWaiters(index)
    undefined

  inTransaction = (event, context, f, args) ->
    if rootEvent
      #console.log "in tx"
      f.apply(context, args)
    else
      #console.log "start tx"
      rootEvent = event
      try
        result = f.apply(context, args)
        #console.log("done with tx")
        flush()
      finally
        rootEvent = undefined
        while (aftersIndex < afters.length)
          after = afters[aftersIndex]
          aftersIndex++
          after()
        aftersIndex = 0
        afters = []
      result

  currentEventId = -> if rootEvent then rootEvent.id else undefined

  wrappedSubscribe = (obs, sink) ->
    unsubd = false
    shouldUnsub = false
    doUnsub = ->
      shouldUnsub = true
    unsub = ->
      unsubd = true
      doUnsub()
    doUnsub = obs.dispatcher.subscribe (event) ->
      afterTransaction ->
        unless unsubd
          reply = sink event
          if reply == Bacon.noMore
            unsub()
    if shouldUnsub
      doUnsub()
    unsub

  hasWaiters = -> waiterObs.length > 0

  { whenDoneWith, hasWaiters, inTransaction, currentEventId, wrappedSubscribe, afterTransaction }
)()


