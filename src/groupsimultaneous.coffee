# build-dependencies: source
# build-dependencies: when

Bacon.groupSimultaneous = (streams...) ->
  if (streams.length == 1 and isArray(streams[0]))
    streams = streams[0]
  sources = for s in streams
    new BufferingSource(s)
  withDesc(new Bacon.Desc(Bacon, "groupSimultaneous", streams), Bacon.when(sources, ((xs...) -> xs)))
