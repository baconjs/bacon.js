# build-dependencies: filter, property, once
# build-dependencies: concat
# build-dependencies: flatmapconcat, later

Bacon.Observable :: bufferingThrottle = (minimumInterval) ->
  withDesc(new Bacon.Desc(this, "bufferingThrottle", [minimumInterval]),
    @flatMapConcat (x) ->
      Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false)))

Bacon.Property :: bufferingThrottle = ->
  Bacon.Observable :: bufferingThrottle.apply(this, arguments).toProperty()
