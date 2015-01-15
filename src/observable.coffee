# build-dependencies: updatebarrier
# build-dependencies: describe
# build-dependencies: functionconstruction
# build-dependencies: optional

idCounter = 0

class Observable
  constructor: (desc) ->
    @id = ++idCounter
    withDescription(desc, this)
    @initialDesc = @desc
  
  subscribe: (sink) ->
    UpdateBarrier.wrappedSubscribe(this, sink)

  subscribeInternal: (sink) ->
    # For backward compatibility. To be removed in 0.8
    @dispatcher.subscribe(sink)

  onValue: ->
    f = makeFunctionArgs(arguments)
    @subscribe (event) ->
      f event.value() if event.hasValue()

  onValues: (f) ->
    @onValue (args) -> f(args...)

  onError: ->
    f = makeFunctionArgs(arguments)
    @subscribe (event) ->
      f event.error if event.isError()

  onEnd: ->
    f = makeFunctionArgs(arguments)
    @subscribe (event) ->
      f() if event.isEnd()

  errors: -> withDescription(this, "errors", @filter(-> false))

  filter: (f, args...) ->
    convertArgsToFunction this, f, args, (f) ->
      withDescription(this, "filter", f, @withHandler (event) ->
        if event.filter(f)
          @push event
        else
          Bacon.more)

  takeWhile: (f, args...) ->
    convertArgsToFunction this, f, args, (f) ->
      withDescription(this, "takeWhile", f, @withHandler (event) ->
        if event.filter(f)
          @push event
        else
          @push endEvent()
          Bacon.noMore)

  endOnError: (f, args...) ->
    f = true unless f?
    convertArgsToFunction this, f, args, (f) ->
      withDescription(this, "endOnError", @withHandler (event) ->
        if event.isError() and f(event.error)
          @push event
          @push endEvent()
        else
          @push event)

  take: (count) ->
    return Bacon.never() if count <= 0
    withDescription(this, "take", count, @withHandler (event) ->
      unless event.hasValue()
        @push event
      else
        count--
        if count > 0
          @push event
        else
          @push event if count == 0
          @push endEvent()
          Bacon.noMore)

  map: (p, args...) ->
    convertArgsToFunction this, p, args, (f) ->
      withDescription(this, "map", f, @withHandler (event) ->
        @push event.fmap(f))

  mapError: ->
    f = makeFunctionArgs(arguments)
    withDescription(this, "mapError", f, @withHandler (event) ->
      if event.isError()
        @push nextEvent (f event.error)
      else
        @push event)

  mapEnd: ->
    f = makeFunctionArgs(arguments)
    withDescription(this, "mapEnd", f, @withHandler (event) ->
      if (event.isEnd())
        @push nextEvent(f(event))
        @push endEvent()
        Bacon.noMore
      else
        @push event)

  doAction: ->
    f = makeFunctionArgs(arguments)
    withDescription(this, "doAction", f, @withHandler (event) ->
      f(event.value()) if event.hasValue()
      @push event)

  skip: (count) ->
    withDescription(this, "skip", count, @withHandler (event) ->
      unless event.hasValue()
        @push event
      else if (count > 0)
        count--
        Bacon.more
      else
        @push event)

  skipDuplicates: (isEqual = (a, b) -> a == b) ->
    withDescription(this, "skipDuplicates",
      @withStateMachine None, (prev, event) ->
        unless event.hasValue()
          [prev, [event]]
        else if event.isInitial() or prev == None or !isEqual(prev.get(), event.value())
          [new Some(event.value()), [event]]
        else
          [prev, []])

  skipErrors: ->
    withDescription(this, "skipErrors", @withHandler (event) ->
      if event.isError()
        Bacon.more
      else
        @push event)

  withStateMachine: (initState, f) ->
    state = initState
    withDescription(this, "withStateMachine", initState, f, @withHandler (event) ->
      fromF = f(state, event)
      [newState, outputs] = fromF
      state = newState
      reply = Bacon.more
      for output in outputs
        reply = @push output
        if reply == Bacon.noMore
          return reply
      reply)

  not: -> withDescription(this, "not", @map((x) -> !x))

  log: (args...) ->
    @subscribe (event) -> console?.log?(args..., event.log())
    this

  name: (name) ->
    @_name = name
    this

  withDescription: ->
    describe(arguments...).apply(this)

  toString: ->
    if @_name
      @_name
    else
      @desc.toString()

  internalDeps: ->
    @initialDesc.deps()

Observable :: reduce = Observable :: fold
Observable :: assign = Observable :: onValue
Observable :: inspect = Observable :: toString

Bacon.Observable = Observable
