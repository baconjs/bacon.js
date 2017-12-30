// build-dependencies: observable
// build-dependencies: describe
// build-dependencies: functionconstruction
// build-dependencies: updatebarrier
// build-dependencies: dispatcher
// build-dependencies: optional
// build-dependencies: helpers
// build-dependencies: _

function PropertyDispatcher(property, subscribe, handleEvent) {
  Dispatcher.call(this, subscribe, handleEvent);
  this.property = property;
  this.subscribe = _.bind(this.subscribe, this);
  this.current = None;
  this.currentValueRootId = undefined;
  this.propertyEnded = false;
}

inherit(PropertyDispatcher, Dispatcher);
extend(PropertyDispatcher.prototype, {
  push(event) {
    if (event.isEnd()) {
      this.propertyEnded = true;
    }
    if (event.hasValue()) {
      //console.log('push', event.value)
      this.current = new Some(event);
      this.currentValueRootId = UpdateBarrier.currentEventId();
    }
    return Dispatcher.prototype.push.call(this, event);
  },

  maybeSubSource(sink, reply) {
    if (reply === Bacon.noMore) {
      return nop;
    } else if (this.propertyEnded) {
      sink(endEvent());
      return nop;
    } else {
      return Dispatcher.prototype.subscribe.call(this, sink);
    }
  },

  subscribe(sink) {
    var initSent = false;
    // init value is "bounced" here because the base Dispatcher class
    // won't add more than one subscription to the underlying observable.
    // without bouncing, the init value would be missing from all new subscribers
    // after the first one
    var reply = Bacon.more;

    if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
      // should bounce init value
      var dispatchingId = UpdateBarrier.currentEventId();
      var valId = this.currentValueRootId;
      if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
        // when subscribing while already dispatching a value and this property hasn't been updated yet
        // we cannot bounce before this property is up to date.
        //console.log "bouncing with possibly stale value", event.value, "root at", valId, "vs", dispatchingId
        UpdateBarrier.whenDoneWith(this.property, () => {
          if (this.currentValueRootId === valId) {
            //console.log("bouncing", this.current.get().value)
            return sink(initialEvent(this.current.get().value));
          }
        });
        // the subscribing thing should be defered
        return this.maybeSubSource(sink, reply);
      } else {
        //console.log("bouncing immdiately", this.current.get().value)
        UpdateBarrier.inTransaction(undefined, this, function() {
          reply = sink(initialEvent(this.current.get().value));
          return reply;
        }, []);
        return this.maybeSubSource(sink, reply);
      }
    } else {
      return this.maybeSubSource(sink, reply);
    }
  }
});

function Property(desc, subscribe, handler) {
  Observable.call(this, desc);
  assertFunction(subscribe);
  this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
  registerObs(this);
}

inherit(Property, Observable);
extend(Property.prototype, {
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
        return sink(event.toNext());
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
