// build-dependencies: observable
// build-dependencies: describe
// build-dependencies: functionconstruction
// build-dependencies: dispatcher
// build-dependencies: optional
// build-dependencies: helpers

function EventStream(desc, subscribe, handler) {
  if (!(this instanceof EventStream)) {
    return new EventStream(desc, subscribe, handler);
  }
  if (_.isFunction(desc)) {
    handler = subscribe;
    subscribe = desc;
    desc = Desc.empty;
  }
  Observable.call(this, desc);
  assertFunction(subscribe);
  this.dispatcher = new Dispatcher(subscribe, handler);
  registerObs(this);
}

inherit(EventStream, Observable);
extend(EventStream.prototype, {
  _isEventStream: true,

  toProperty(initValue_) {
    var initValue = arguments.length === 0 ? None : toOption(initValue_);
    var disp = this.dispatcher;
    var desc = new Bacon.Desc(this, "toProperty", [initValue_]);
    return new Property(desc, function(sink) {
      var initSent = false;
      var subbed = false;
      var unsub = nop;
      var reply = Bacon.more;
      var sendInit = function() {
        if (!initSent) {
          return initValue.forEach(function(value) {
            initSent = true;
            reply = sink(new Initial(value));
            if (reply === Bacon.noMore) {
              unsub();
              unsub = nop;
              return nop;
            }
          });
        }
      };

      unsub = disp.subscribe(function(event) {
        if (event.hasValue()) {
          if (event.isInitial() && !subbed) {
            initValue = new Some(event.value);
            return Bacon.more;
          } else {
            if (!event.isInitial()) { sendInit(); }
            initSent = true;
            initValue = new Some(event.value);
            return sink(event);
          }
        } else {
          if (event.isEnd()) {
            reply = sendInit();
          }
          if (reply !== Bacon.noMore) { return sink(event); }
        }
      });
      subbed = true;
      sendInit();
      return unsub;
    }
    );
  },

  toEventStream() { return this; },

  withHandler(handler) {
    return new EventStream(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
  }
});

Bacon.EventStream = EventStream;

Bacon.never = function() {
  return new EventStream(describe(Bacon, "never"), (sink) => {
    sink(endEvent());
    return nop;
  });
};
