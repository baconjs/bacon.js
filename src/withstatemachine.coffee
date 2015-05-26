# build-dependencies: observable, property, combine

Bacon.Observable :: withStateMachine = (initState, f) ->
  state = initState
  withDesc(new Bacon.Desc(this, "withStateMachine", [initState, f]), @withHandler (event) ->
    fromF = f(state, event)
    [newState, outputs] = fromF
    state = newState
    reply = Bacon.more
    for output in outputs
      reply = @push output
      if reply == Bacon.noMore
        return reply
    reply)
