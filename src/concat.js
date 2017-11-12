// build-dependencies: core, observable, eventstream, property
// build-dependencies: updatebarrier, argumentstoobservables, addpropertyinitialvaluetostream

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
