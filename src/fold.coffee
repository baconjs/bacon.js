# build-dependencies: sample, scan, mapend, filter

Bacon.Observable :: fold = (seed, f) ->
  withDesc(new Bacon.Desc(this, "fold", [seed, f]), @scan(seed, f).sampledBy(@filter(false).mapEnd().toProperty()))

Observable :: reduce = Observable :: fold
