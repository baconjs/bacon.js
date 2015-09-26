# build-dependencies: updatebarrier
# build-dependencies: describe
# build-dependencies: functionconstruction
# build-dependencies: optional
# build-dependencies: reply
# build-dependencies: event

idCounter = 0
registerObs = ->

class Observable
  constructor: (@desc) ->
    @id = ++idCounter
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

  name: (name) ->
    @_name = name
    this

  withDescription: ->
    @desc = describe(arguments...)
    this

  toString: ->
    if @_name
      @_name
    else
      @desc.toString()

  internalDeps: ->
    @initialDesc.deps()

Observable :: assign = Observable :: onValue
Observable :: forEach = Observable :: onValue
Observable :: inspect = Observable :: toString

Bacon.Observable = Observable
