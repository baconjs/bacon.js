// build-dependencies: later
// build-dependencies: flatmap
// build-dependencies: delaychanges

Bacon.Observable.prototype.delay = function(delay) { 
  return this.delayChanges(new Bacon.Desc(this, "delay", [delay]), function(changes) { 
    return changes.flatMap(function(value) {
      return Bacon.later(delay, value);
    })
  })
};
