// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapFirst = function() {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(arguments)), 
    new Bacon.Desc(this, "flatMapFirst", arguments), 
    {firstOnly: true}
  );
};