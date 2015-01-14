// build-dependencies: core

// TODO: cleanup coffeism

// eventTransformer - defaults to returning the first argument to handler
Bacon.$ = {};
Bacon.$.asEventStream = function(eventName, selector, eventTransformer) {
  // selector is optional argument
  if (isFunction(selector)) {
  	eventTransformer = selector;
  	selector = undefined;
  }

  return withDescription(this.selector || this, "asEventStream", eventName, Bacon.fromBinder((function(_this) {
    return function(handler) {
      _this.on(eventName, selector, handler);
      return function() {
        return _this.off(eventName, selector, handler);
      };
    };
  })(this), eventTransformer));
};

if (typeof jQuery === "object") {
  jQuery.fn.asEventStream = Bacon.$.asEventStream;
} else if (typeof Zepto === "object") {
  Zepto.fn.asEventStream = Bacon.$.asEventStream;
}
