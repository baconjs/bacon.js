# build-dependencies: when, scan

Bacon.update = (initial, patterns...) ->
  lateBindFirst = (f) -> (args...) -> (i) -> f([i].concat(args)...)
  i = patterns.length - 1
  while (i > 0)
    unless patterns[i] instanceof Function
      patterns[i] = do (x = patterns[i]) -> (-> x)
    patterns[i] = lateBindFirst patterns[i]
    i = i - 2
  withDesc(new Bacon.Desc(Bacon, "update", [initial, patterns...]), Bacon.when(patterns...).scan initial, ((x,f) -> f x))
