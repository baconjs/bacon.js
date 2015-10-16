# build-dependencies: sample, scan, mapend, filter

Bacon.Observable.prototype.fold = (seed, f) ->
  withDesc(new Bacon.Desc(this, "fold", [seed, f]), @scan(seed, f).sampledBy(@filter(false).mapEnd().toProperty()))

Observable.prototype.reduce = Observable.prototype.fold
