// build-dependencies: eventstream, event, later, updatebarrier
Bacon.once = function(value) {
  return s = new EventStream(new Desc(Bacon, "once", [value]), function(sink) {
    UpdateBarrier.soonButNotYet(s, function() {
      sink(toEvent(value));
      sink(endEvent());  
    })
    return nop;
  });
};
