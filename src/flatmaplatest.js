// build-dependencies: core, functionconstruction, flatmap
// build-dependencies: compositeunsubscribe, takeuntil

Bacon.Observable.prototype.flatMapLatest = function() {
  var f = makeSpawner(arguments);
  var stream = this.toEventStream();
  return withDesc(new Bacon.Desc(this, "flatMapLatest", [f]), stream.flatMap(function(value) {
    return makeObservable(f(value)).toEventStream().takeUntil(stream);
  }));
};
