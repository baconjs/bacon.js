# build-dependencies: core, withstatemachine

Bacon.Observable :: skipDuplicates = (isEqual = (a, b) -> a == b) ->
  withDesc(new Bacon.Desc(this, "skipDuplicates", []),
    @withStateMachine None, (prev, event) ->
      unless event.hasValue()
        [prev, [event]]
      else if event.isInitial() or prev == None or !isEqual(prev.get(), event.value())
        [new Some(event.value()), [event]]
      else
        [prev, []])
