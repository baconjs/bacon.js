// build-dependencies: core
// build-dependencies: functionconstruction
// build-dependencies: when
// build-dependencies: updatebarrier

Bacon.Observable.prototype.scan = function(seed, f) {
  var resultProperty;
  f = toCombinator(f);
  var acc = seed
  var initHandled = false;
  var subscribe = (sink) => {
    var initSent = false;
    var unsub = nop;
    var reply = Bacon.more;
    var sendInit = function() {
      if (!initSent) {
        initSent = initHandled = true;
        reply = sink(new Initial(acc));
        if (reply === Bacon.noMore) {
          unsub();
          unsub = nop;
        }
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
          var prev = acc
          var next = f(prev, event.value);
          //console.log prev , ",", event.value, "->", next
          acc = next
          return sink(event.apply(next));
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
  return resultProperty = new Property(new Bacon.Desc(this, "scan", [seed, f]), subscribe)
};
