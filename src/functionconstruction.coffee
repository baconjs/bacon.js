# build-dependencies: _

withMethodCallSupport = (wrapped) ->
  (f, args...) ->
    if typeof f == "object" and args.length
      context = f
      methodName = args[0]
      f = ->
        context[methodName](arguments...)
      args = args.slice(1)
    wrapped(f, args...)

makeFunctionArgs = (args) ->
  args = Array.prototype.slice.call(args)
  makeFunction_(args...)

partiallyApplied = (f, applied) ->
  (args...) -> f((applied.concat(args))...)

toSimpleExtractor = (args) -> (key) -> (value) ->
  unless value?
    undefined
  else
    fieldValue = value[key]
    if _.isFunction(fieldValue)
      fieldValue.apply(value, args)
    else
      fieldValue

toFieldExtractor = (f, args) ->
  parts = f.slice(1).split(".")
  partFuncs = _.map(toSimpleExtractor(args), parts)
  (value) ->
    for f in partFuncs
      value = f(value)
    value

isFieldKey = (f) ->
  (typeof f == "string") and f.length > 1 and f.charAt(0) == "."

makeFunction_ = withMethodCallSupport (f, args...) ->
  if _.isFunction f
    if args.length then partiallyApplied(f, args) else f
  else if isFieldKey(f)
    toFieldExtractor(f, args)
  else
    _.always f

makeFunction = (f, args) ->
  makeFunction_(f, args...)

convertArgsToFunction = (obs, f, args, method) ->
  if f instanceof Property
    sampled = f.sampledBy(obs, (p,s) -> [p,s])
    method.call(sampled, ([p, s]) -> p)
      .map(([p, s]) -> s)
  else
    f = makeFunction(f, args)
    method.call(obs, f)

toCombinator = (f) ->
  if _.isFunction f
    f
  else if isFieldKey f
    key = toFieldKey(f)
    (left, right) ->
      left[key](right)
  else
    throw new Exception("not a function or a field key: " + f)

toFieldKey = (f) ->
  f.slice(1)
