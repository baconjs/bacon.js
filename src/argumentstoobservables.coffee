# build-dependencies: _, helpers

argumentsToObservables = (args) ->
  if isArray args[0]
    args[0]
  else
    Array::slice.call(args)

argumentsToObservablesAndFunction = (args) ->
  if _.isFunction args[0]
    [argumentsToObservables(Array::slice.call(args, 1)), args[0]]
  else
    [argumentsToObservables(Array::slice.call(args, 0, args.length-1)), _.last(args) ]
