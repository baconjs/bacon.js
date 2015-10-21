// build-dependencies: eventstream
// build-dependencies: updatebarrier
// build-dependencies: concat

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
