// build-dependencies: scheduler, frombinder

Bacon.fromPoll = function(delay, poll) {
  var desc = new Bacon.Desc(Bacon, "fromPoll", [delay, poll]);
  return withDesc(desc, Bacon.fromBinder((function(handler) {
    var id = Bacon.scheduler.setInterval(handler, delay);
    return function() { return Bacon.scheduler.clearInterval(id); };
  }), poll));
};
