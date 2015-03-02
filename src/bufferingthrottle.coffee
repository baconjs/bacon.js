# build-dependencies: filter, property, once
# build-dependencies: concat
# build-dependencies: flatmapconcat, scheduled

Bacon.Observable :: bufferingThrottle = (minimumInterval) ->
  withDescription(this, "bufferingThrottle", minimumInterval,
    @flatMapConcat (x) ->
      Bacon.immediately(x).concat(Bacon.later(minimumInterval).filter(false)))

Bacon.Property :: bufferingThrottle = ->
  Bacon.Observable :: bufferingThrottle.apply(this, arguments).toProperty()
