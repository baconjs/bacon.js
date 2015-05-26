# build-dependencies: core, factories

# eventTransformer - defaults to returning the first argument to handler
Bacon.$ = {}
Bacon.$.asEventStream = (eventName, selector, eventTransformer) ->
  [eventTransformer, selector] = [selector, undefined] if _.isFunction(selector)
  withDesc(new Bacon.Desc(@selector or this, "asEventStream", [eventName]), Bacon.fromBinder (handler) =>
    @on(eventName, selector, handler)
    => @off(eventName, selector, handler)
  , eventTransformer)

(jQuery ? (Zepto ? undefined))?.fn.asEventStream = Bacon.$.asEventStream
