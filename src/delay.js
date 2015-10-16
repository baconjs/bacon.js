// build-dependencies: later
// build-dependencies: flatmap
// build-dependencies: delaychanges

Bacon.EventStream.prototype.delay = function(delay) {
  return withDesc(new Bacon.Desc(this, "delay", [delay]), this.flatMap(function(value) {
    return Bacon.later(delay, value);
  }));
};

Bacon.Property.prototype.delay = function(delay) { return this.delayChanges(new Bacon.Desc(this, "delay", [delay]), function(changes) { return changes.delay(delay); }); };
