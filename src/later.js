// build-dependencies: frombinder, scheduler
Bacon.later = function(delay, value) {
  return withDesc(new Bacon.Desc(Bacon, "later", [delay, value]), Bacon.fromBinder(function(sink) {
    var sender = function() { return sink([value, endEvent()]); };
    var id = Bacon.scheduler.setTimeout(sender, delay);
    return function() { return Bacon.scheduler.clearTimeout(id); };
  }));
};
