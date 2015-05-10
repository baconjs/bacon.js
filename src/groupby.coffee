# build-dependencies: filter, map, once, concat, observable

Bacon.Observable :: groupBy = (keyF, limitF = Bacon._.id) ->
  streams = {}
  src = this
  src.filter((x) -> !streams[keyF(x)])
  .map (x) ->
    key = keyF(x)
    similar = src.filter((x) -> keyF(x) == key)
    data = Bacon.once(x).concat(similar)
    limited = limitF(data, x).withHandler((event) ->
      @push(event)
      if event.isEnd()
        delete streams[key]
    )
    streams[key] = limited