// build-dependencies: eventstream, event
Bacon.once = function(value) {
  return new EventStream(new Desc(Bacon, "once", [value]), function(sink) {
    sink(toEvent(value));
    sink(endEvent());
    return nop;
  });
};
