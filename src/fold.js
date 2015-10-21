// build-dependencies: sample, scan, mapend, filter

Bacon.Observable.prototype.fold = function(seed, f) {
  return withDesc(
    new Bacon.Desc(this, "fold", [seed, f]),
    this.scan(seed, f).sampledBy(this.filter(false).mapEnd().toProperty())
  );
};

Observable.prototype.reduce = Observable.prototype.fold;
