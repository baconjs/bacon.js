# build-dependencies: source

Bacon.groupSimultaneous = (streams...) ->
  if (streams.length == 1 and isArray(streams[0]))
    streams = streams[0]
  sources = for s in streams
    new BufferingSource(s)
  withDescription(Bacon, "groupSimultaneous", streams..., Bacon.when(sources, ((xs...) -> xs)))
