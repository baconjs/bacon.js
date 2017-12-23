// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMap = function() {
  return flatMap_(this, makeSpawner(arguments), new Bacon.Desc(this, "flatMap", arguments));
};