# build-dependencies: core, once
Bacon.try = (f) ->
  (value) ->
    try
      Bacon.once(f(value))
    catch e
      new Bacon.Error(e)
