// build-dependencies: core

Bacon.Observable.prototype.first = function () {
  // It's important not to use fat arrow here!
  return withDescription(this, "first", this.take(1));
};
