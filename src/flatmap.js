// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMap = function() {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(arguments)), 
    { desc: new Bacon.Desc(this, "flatMap", arguments) }
  );
};