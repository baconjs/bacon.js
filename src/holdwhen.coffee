# build-dependencies: fromarray
# build-dependencies: when
# build-dependencies: once

Bacon.EventStream :: holdWhen = (valve) ->
  onHold = false
  bufferedValues = []
  combined = Bacon.when(
    [this], (value) -> { value: value, hasValue: true },
    [valve.toEventStream()], (value) -> { newOnHold: value })
  withDescription this, "holdWhen", valve, combined.flatMap ({ value, newOnHold, hasValue }) ->
      onHold = newOnHold if newOnHold?
      if hasValue
        if !onHold
          Bacon.once(value)
        else
          bufferedValues.push(value)
          Bacon.never()
      else
        if onHold
          Bacon.never()
        else
          toSend = bufferedValues
          bufferedValues = []
          Bacon.fromArray(toSend)
