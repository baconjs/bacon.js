# build-dependencies: _, core, argumentstoobservables
# build-dependencies: when

Bacon.zipAsArray = ->
  streams = argumentsToObservables(arguments)
  withDesc(new Bacon.Desc(Bacon, "zipAsArray", streams), Bacon.zipWith(streams, (xs...) -> xs))

Bacon.zipWith = ->
  [streams, f] = argumentsToObservablesAndFunction(arguments)
  streams = _.map(((s) -> s.toEventStream()), streams)
  withDesc(new Bacon.Desc(Bacon, "zipWith", [f, streams...]), Bacon.when(streams, f))

Bacon.Observable :: zip = (other, f = Array) ->
  withDesc(new Bacon.Desc(this, "zip", [other]),
    Bacon.zipWith([this,other], f))
