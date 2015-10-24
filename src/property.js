// build-dependencies: observable
// build-dependencies: describe
// build-dependencies: functionconstruction
// build-dependencies: propertydispatcher
// build-dependencies: optional
// build-dependencies: helpers

function Property(desc, subscribe, handler) {
  Observable.call(this, desc);
  assertFunction(subscribe);
  this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
  registerObs(this);
}

_.extendClass(Property, Observable);
_.extend(Property.prototype, {
  _isProperty: true,

  changes() {
    return new EventStream(new Bacon.Desc(this, "changes", []), (sink) => {
      return this.dispatcher.subscribe(function(event) {
        if (!event.isInitial()) { return sink(event); }
      });
    });
  },

  withHandler(handler) {
    return new Property(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
  },

  toProperty() {
    assertNoArguments(arguments);
    return this;
  },

  toEventStream() {
    return new EventStream(new Bacon.Desc(this, "toEventStream", []), (sink) => {
      return this.dispatcher.subscribe(function(event) {
        if (event.isInitial()) { event = event.toNext(); }
        return sink(event);
      });
    });
  }
});

Bacon.Property = Property;

Bacon.constant = function(value) {
  return new Property(new Bacon.Desc(Bacon, "constant", [value]), function(sink) {
    sink(initialEvent(value));
    sink(endEvent());
    return nop;
  });
};
