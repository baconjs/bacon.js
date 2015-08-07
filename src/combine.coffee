# build-dependencies: core, source, map
# build-dependencies: functionconstruction
# build-dependencies: when

Bacon.combineAsArray = (streams...) ->
  if (streams.length == 1 and isArray(streams[0]))
    streams = streams[0]
  for stream, index in streams
    streams[index] = Bacon.constant(stream) unless (isObservable(stream))
  if streams.length
    sources = for s in streams
      new Source(s, true)
    withDesc(new Bacon.Desc(Bacon, "combineAsArray", streams), Bacon.when(sources, ((xs...) -> xs)).toProperty())
  else
    Bacon.constant([])

Bacon.onValues = (streams..., f) -> Bacon.combineAsArray(streams).onValues(f)

Bacon.combineWith = (f, streams...) ->
  if (streams.length == 1 and isArray(streams[0]))
    streams = streams[0]
  withDesc(new Bacon.Desc(Bacon, "combineWith", [f, streams...]), Bacon.combineAsArray(streams).map (values) -> f(values...))

Bacon.Observable :: combine = (other, f) ->
  combinator = toCombinator(f)
  withDesc(new Bacon.Desc(this, "combine", [other, f]),
    Bacon.combineAsArray(this, other)
      .map (values) ->
        combinator(values[0], values[1]))
