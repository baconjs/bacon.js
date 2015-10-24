// build-dependencies: flatmapwithconcurrencylimit

Bacon.Observable.prototype.flatMapConcat = function() {
  var desc = new Bacon.Desc(this, "flatMapConcat", Array.prototype.slice.call(arguments, 0));
  return withDesc(desc, this.flatMapWithConcurrencyLimit(1, ...arguments));
};
