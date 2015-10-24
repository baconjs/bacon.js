// build-dependencies: optional
// build-dependencies: core
// build-dependencies: functionconstruction
// build-dependencies: when
// build-dependencies: updatebarrier

Bacon.Observable.prototype.scan = function(seed, f) {
  var resultProperty;
  f = toCombinator(f);
  var acc = toOption(seed);
  var initHandled = false;
  var subscribe = (sink) => {
    var initSent = false;
    var unsub = nop;
    var reply = Bacon.more;
    var sendInit = function() {
      if (!initSent) {
        return acc.forEach(function(value) {
          initSent = initHandled = true;
          reply = sink(new Initial(() => value));
          if (reply === Bacon.noMore) {
            unsub();
            unsub = nop;
            return unsub;
          }
        });
      }
    };
    unsub = this.dispatcher.subscribe(function(event) {
      if (event.hasValue()) {
        if (initHandled && event.isInitial()) {
          //console.log "skip INITIAL"
          return Bacon.more; // init already sent, skip this one
        } else {
          if (!event.isInitial()) { sendInit(); }
          initSent = initHandled = true;
          var prev = acc.getOrElse(undefined);
          var next = f(prev, event.value());
          //console.log prev , ",", event.value(), "->", next
          acc = new Some(next);
          return sink(event.apply(() => next));
        }
      } else {
        if (event.isEnd()) {
          reply = sendInit();
        }
        if (reply !== Bacon.noMore) {
          return sink(event);
        }
      }
    });
    UpdateBarrier.whenDoneWith(resultProperty, sendInit);
    return unsub;
  };
  resultProperty = new Property(new Bacon.Desc(this, "scan", [seed, f]), subscribe);
  return resultProperty;
};
