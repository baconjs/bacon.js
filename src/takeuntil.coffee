# build-dependencies: core
# build-dependencies: addpropertyinitialvaluetostream
# build-dependencies: mapend
# build-dependencies: skiperrors
# build-dependencies: groupsimultaneous

Bacon.EventStream :: takeUntil = (stopper) ->
  endMarker = {}
  withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), Bacon.groupSimultaneous(@mapEnd(endMarker), stopper.skipErrors())
    .withHandler((event) ->
      unless event.hasValue()
        @push event
      else
        [data, stopper] = event.value()
        if stopper.length
#            console.log(_.toString(data), "stopped by", _.toString(stopper))
          @push endEvent()
        else
          reply = Bacon.more
          for value in data
            if value == endMarker
              reply = @push endEvent()
            else
              reply = @push nextEvent(value)
          reply
    ))

Bacon.Property :: takeUntil = (stopper) ->
  changes = @changes().takeUntil(stopper)
  withDesc(new Bacon.Desc(this, "takeUntil", [stopper]),
    addPropertyInitValueToStream(this, changes))

