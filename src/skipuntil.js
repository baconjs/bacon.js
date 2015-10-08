// build-dependencies: core, take, map, sample

Bacon.EventStream.prototype.skipUntil = function(starter) {
  var started = starter.take(1).map(true).toProperty(false);
  return withDesc(new Bacon.Desc(this, "skipUntil", [starter]), this.filter(started));
};
