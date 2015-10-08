// build-dependencies: frompoll

Bacon.interval = function(delay, value) {
  if (!(typeof value !== "undefined" && value !== null)) { value = {}; }
  return withDesc(new Bacon.Desc(Bacon, "interval", [delay, value]), Bacon.fromPoll(delay, function() { return nextEvent(value); }));
};

