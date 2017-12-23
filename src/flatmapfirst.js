// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapFirst = function() {
  return flatMap_(this, makeSpawner(arguments), new Bacon.Desc(this, "flatMapFirst", arguments), {firstOnly: true});
};