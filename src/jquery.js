// build-dependencies: core, frombinder

// eventTransformer - defaults to returning the first argument to handler
Bacon.$ = {};
Bacon.$.asEventStream = function(eventName, selector, eventTransformer) {
  if (_.isFunction(selector)) {
    eventTransformer = selector;
    selector = undefined;
  }

  return withDesc(new Bacon.Desc(this.selector || this, "asEventStream", [eventName]), Bacon.fromBinder((handler) => {
    this.on(eventName, selector, handler);
    return (() => this.off(eventName, selector, handler));
  }, eventTransformer));
};

if (typeof jQuery !== "undefined" && jQuery) {
  jQuery.fn.asEventStream = Bacon.$.asEventStream;
}

if (typeof Zepto !== "undefined" && Zepto) {
  Zepto.fn.asEventStream = Bacon.$.asEventStream;
}
