// build-dependencies: flatmaplatest, delay, once
// build-dependencies: concat, filter

Bacon.EventStream.prototype.debounce = function(delay) {
  return withDesc(new Bacon.Desc(this, "debounce", [delay]), this.flatMapLatest(function(value) {
    return Bacon.later(delay, value);
  }));
};

Bacon.Property.prototype.debounce = function(delay) { return this.delayChanges(new Bacon.Desc(this, "debounce", [delay]), function(changes) { return changes.debounce(delay); }); };

Bacon.EventStream.prototype.debounceImmediate = function(delay) {
  return withDesc(new Bacon.Desc(this, "debounceImmediate", [delay]), this.flatMapFirst(function(value) {
    return Bacon.once(value).concat(Bacon.later(delay).filter(false));
  }));
};
