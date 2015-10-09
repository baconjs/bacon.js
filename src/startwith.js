// build-dependencies: scan, concat, once

Bacon.Property.prototype.startWith = function(seed) {
  return withDesc(new Bacon.Desc(this, "startWith", [seed]),
    this.scan(seed, (prev, next) => next));
};

Bacon.EventStream.prototype.startWith = function(seed) {
  return withDesc(new Bacon.Desc(this, "startWith", [seed]),
    Bacon.once(seed).concat(this));
};
