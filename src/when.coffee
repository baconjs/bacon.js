# build-dependencies: compositeunsubscribe, eventstream
# build-dependencies: updatebarrier

Bacon.when = ->
  return Bacon.never() if arguments.length == 0
  len = arguments.length
  usage = "when: expecting arguments in the form (Observable+,function)+"

  assert usage, (len % 2 == 0)
  sources = []
  pats = []
  i = 0
  patterns = []
  while (i < len)
    patterns[i] = arguments[i]
    patterns[i + 1] = arguments[i + 1]
    patSources = _.toArray arguments[i]
    f = constantToFunction(arguments[i + 1])
    pat = {f, ixs: []}
    triggerFound = false
    for s in patSources
      index = _.indexOf(sources, s)
      unless triggerFound
        triggerFound = Source.isTrigger(s)
      if index < 0
        sources.push(s)
        index = sources.length - 1
      (ix.count++ if ix.index == index) for ix in pat.ixs
      pat.ixs.push {index: index, count: 1}
    assert "At least one EventStream required", (triggerFound or (!patSources.length))

    pats.push pat if patSources.length > 0
    i = i + 2

  unless sources.length
    return Bacon.never()

  sources = _.map Source.fromObservable, sources
  needsBarrier = (_.any sources, (s) -> s.flatten) and (containsDuplicateDeps (_.map ((s) -> s.obs), sources))

  resultStream = new EventStream (new Bacon.Desc(Bacon, "when", patterns)), (sink) ->
    triggers = []
    ends = false
    match = (p) ->
      for i in p.ixs
        unless sources[i.index].hasAtLeast(i.count)
          return false
      return true
    cannotSync = (source) ->
      !source.sync or source.ended
    cannotMatch = (p) ->
      for i in p.ixs
        unless sources[i.index].mayHave(i.count)
          return true
    nonFlattened = (trigger) -> !trigger.source.flatten
    part = (source) -> (unsubAll) ->
      flushLater = ->
        UpdateBarrier.whenDoneWith resultStream, flush
      flushWhileTriggers = ->
        if triggers.length > 0
          reply = Bacon.more
          trigger = triggers.pop()
          for p in pats
            if match(p)
              #console.log "match", p
              events = (sources[i.index].consume() for i in p.ixs)
              reply = sink trigger.e.apply ->
                values = (event.value() for event in events)
                #console.log "flushing values", values
                p.f(values...)
              if triggers.length
                triggers = _.filter nonFlattened, triggers
              if reply == Bacon.noMore
                return reply
              else
                return flushWhileTriggers()
        else
          Bacon.more
      flush = ->
        #console.log "flushing", _.toString(resultStream)
        reply = flushWhileTriggers()
        if ends
          #console.log "ends detected"
          if  _.all(sources, cannotSync) or _.all(pats, cannotMatch)
            #console.log "actually ending"
            reply = Bacon.noMore
            sink endEvent()
        unsubAll() if reply == Bacon.noMore
        #console.log "flushed"
        reply
      source.subscribe (e) ->
        if e.isEnd()
          #console.log "got end"
          ends = true
          source.markEnded()
          flushLater()
        else if e.isError()
          reply = sink e
        else
          #console.log "got value", e.value()
          source.push e
          if source.sync
            #console.log "queuing", e.toString(), _.toString(resultStream)
            triggers.push {source: source, e: e}
            if needsBarrier or UpdateBarrier.hasWaiters() then flushLater() else flush()
        unsubAll() if reply == Bacon.noMore
        reply or Bacon.more

    new Bacon.CompositeUnsubscribe(part s for s in sources).unsubscribe

containsDuplicateDeps = (observables, state = []) ->
  checkObservable = (obs) ->
    if _.contains(state, obs)
      true
    else
      deps = obs.internalDeps()
      if deps.length
        state.push(obs)
        _.any(deps, checkObservable)
      else
        state.push(obs)
        false

  _.any observables, checkObservable

constantToFunction = (f) ->
  if _.isFunction f
    f
  else
    _.always(f)

