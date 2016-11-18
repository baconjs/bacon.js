// build-dependencies: flatmaplatest, delay, once
// build-dependencies: concat, filter

Bacon.Observable.prototype.debounce = function(delay) { 
  return this.delayChanges(new Bacon.Desc(this, "debounce", [delay]), function(changes) { 
    return changes.flatMapLatest(function(value) {
      return Bacon.later(delay, value)
    })
  })
}

Bacon.Observable.prototype.debounceImmediate = function(delay) { 
  return this.delayChanges(new Bacon.Desc(this, "debounceImmediate", [delay]), function(changes) { 
    return changes.flatMapFirst(function(value) {
      return Bacon.once(value).concat(Bacon.later(delay).filter(false));
    })
  })
}
