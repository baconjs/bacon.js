// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapFirst = function() {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(arguments)), 
    {
      firstOnly: true,
      desc: new Bacon.Desc(this, "flatMapFirst", arguments)
    }
  );
};