# build-dependencies: filter
# build-dependencies: concat
# build-dependencies: flatmapconcat, scheduled

Bacon.Observable :: bufferingThrottle = (minimumInterval) ->
  withDescription(this, "bufferingThrottle", minimumInterval,
    @flatMapConcat (x) ->
      Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false)))

Bacon.Property :: bufferingThrottle = ->
  Bacon.Observable :: bufferingThrottle.apply(this, arguments).toProperty()
