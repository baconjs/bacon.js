// build-dependencies: core

Bacon.Observable.prototype.skip = function(count) {
  return withDesc(new Bacon.Desc(this, "skip", [count]), this.withHandler(function(event) {
    if (!event.hasValue()) {
      return this.push(event);
    } else if (count > 0) {
      count--;
      return Bacon.more;
    } else {
      return this.push(event);
    }
  }));
};
