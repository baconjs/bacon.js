# build-dependencies: observable
# build-dependencies: describe
# build-dependencies: functionconstruction
# build-dependencies: updatebarrier
# build-dependencies: propertydispatcher
# build-dependencies: optional
# build-dependencies: helpers

class Property extends Observable
  _isProperty: true

  constructor: (desc, subscribe, handler) ->
    super(desc)
    assertFunction(subscribe)
    @dispatcher = new PropertyDispatcher(this, subscribe, handler)
    registerObs(this)

  changes: -> new EventStream (new Bacon.Desc(this, "changes", [])), (sink) =>
    @dispatcher.subscribe (event) ->
      sink event unless event.isInitial()

  withHandler: (handler) ->
    new Property (new Bacon.Desc(this, "withHandler", [handler])), @dispatcher.subscribe, handler

  toProperty: ->
    assertNoArguments(arguments)
    this

  toEventStream: ->
    new EventStream (new Bacon.Desc(this, "toEventStream", [])), (sink) =>
      @dispatcher.subscribe (event) ->
        event = event.toNext() if event.isInitial()
        sink event

Bacon.Property = Property

Bacon.constant = (value) ->
  new Property (new Bacon.Desc(Bacon, "constant", [value])), (sink) ->
    sink (initialEvent value)
    sink (endEvent())
    nop
