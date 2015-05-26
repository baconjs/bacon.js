# build-dependencies: flatmap, maperror, once

Bacon.Observable :: flatMapError = (fn) ->
  withDesc(new Bacon.Desc(this, "flatMapError", [fn]), @mapError((err) -> new Error(err)).flatMap (x) ->
    if x instanceof Error
      fn(x.error)
    else
      Bacon.once(x))
