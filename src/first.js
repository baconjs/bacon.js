// build-dependencies: core, take

Bacon.Observable.prototype.first = function () {
  // It's important not to use fat arrow here!
  return withDesc(new Bacon.Desc(this, "first", []), this.take(1));
};
