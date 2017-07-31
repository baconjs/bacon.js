// build-dependencies: core, observable, eventstream, property
// build-dependencies: updatebarrier, argumentstoobservables

Bacon.EventStream.prototype.concat = function(right) {
  var left = this;
  return new EventStream(new Bacon.Desc(left, "concat", [right]), function(sink) {
    var unsubRight = nop;
    var unsubLeft = left.dispatcher.subscribe(function(e) {
      if (e.isEnd()) {
        unsubRight = right.toEventStream().dispatcher.subscribe(sink);
        return unsubRight;
      } else {
        return sink(e);
      }
    });
    return function() {
      return unsubLeft() , unsubRight();
    };
  });
};

Bacon.Property.prototype.concat = function(right) {
  return addPropertyInitValueToStream(this, this.changes().concat(right))
}

Bacon.concatAll = function() {
  var streams = argumentsToObservables(arguments);
  if (streams.length) {
    return withDesc(
      new Bacon.Desc(Bacon, "concatAll", streams),
      _.fold(_.tail(streams), _.head(streams).toEventStream(), (a, b) => a.concat(b))    
    )
  } else {
    return Bacon.never();
  }
};

var addPropertyInitValueToStream = function(property, stream) {
  var justInitValue = new EventStream(describe(property, "justInitValue"), function(sink) {
    var value = undefined;
    var unsub = property.dispatcher.subscribe(function(event) {
      if (!event.isEnd()) {
        value = event;
      }
      return Bacon.noMore;
    });
    UpdateBarrier.whenDoneWith(justInitValue, function() {
      if ((typeof value !== "undefined" && value !== null)) {
        sink(value);
      }
      return sink(endEvent());
    });
    return unsub;
  });
  return justInitValue.concat(stream).toProperty();
};
