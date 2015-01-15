# build-dependencies: _, core
# build-dependencies: when

Bacon.zipAsArray = (streams...) ->
  if isArray streams[0]
    streams = streams[0]
  withDescription(Bacon, "zipAsArray", streams..., Bacon.zipWith(streams, (xs...) -> xs))

Bacon.zipWith = (f, streams...) ->
  unless _.isFunction(f)
    [streams, f] = [f, streams[0]]
  streams = _.map(((s) -> s.toEventStream()), streams)
  withDescription(Bacon, "zipWith", f, streams..., Bacon.when(streams, f))

Bacon.Observable :: zip = (other, f = Array) ->
  withDescription(this, "zip", other,
    Bacon.zipWith([this,other], f))
