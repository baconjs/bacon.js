// build-dependencies: flatmapconcat, doaction

Bacon.EventStream.prototype.flatScan = function(seed, f) {
  let current = seed
  return this.flatMapConcat(next =>
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty(seed)
}
