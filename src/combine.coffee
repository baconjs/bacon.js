# build-dependencies: core

Bacon.combineAsArray = (streams...) ->
  if (streams.length == 1 and isArray(streams[0]))
    streams = streams[0]
  for stream, index in streams
    streams[index] = Bacon.constant(stream) unless (isObservable(stream))
  if streams.length
    sources = for s in streams
      new Source(s, true)
    withDescription(Bacon, "combineAsArray", streams..., Bacon.when(sources, ((xs...) -> xs)).toProperty())
  else
    Bacon.constant([])

Bacon.onValues = (streams..., f) -> Bacon.combineAsArray(streams).onValues(f)

Bacon.combineWith = (f, streams...) ->
  withDescription(Bacon, "combineWith", f, streams..., Bacon.combineAsArray(streams).map (values) -> f(values...))

Bacon.combineTemplate = (template) ->
  funcs = []
  streams = []
  current = (ctxStack) -> ctxStack[ctxStack.length - 1]
  setValue = (ctxStack, key, value) -> current(ctxStack)[key] = value
  applyStreamValue = (key, index) -> (ctxStack, values) -> setValue(ctxStack, key, values[index])
  constantValue = (key, value) -> (ctxStack) -> setValue(ctxStack, key, value)
  mkContext = (template) -> if isArray(template) then [] else {}
  compile = (key, value) ->
    if (isObservable(value))
      streams.push(value)
      funcs.push(applyStreamValue(key, streams.length - 1))
    else if (value == Object(value) and typeof value != "function" and !(value instanceof RegExp) and !(value instanceof Date))
      pushContext = (key) -> (ctxStack) ->
        newContext = mkContext(value)
        setValue(ctxStack, key, newContext)
        ctxStack.push(newContext)
      popContext = (ctxStack) -> ctxStack.pop()
      funcs.push(pushContext(key))
      compileTemplate(value)
      funcs.push(popContext)
    else
      funcs.push(constantValue(key, value))
  compileTemplate = (template) -> _.each(template, compile)
  compileTemplate template
  combinator = (values) ->
    rootContext = mkContext(template)
    ctxStack = [rootContext]
    for f in funcs
      f(ctxStack, values)
    rootContext
  withDescription(Bacon, "combineTemplate", template, Bacon.combineAsArray(streams).map(combinator))

Bacon.Observable :: combine = (other, f) ->
  combinator = toCombinator(f)
  withDescription(this, "combine", other, f,
    Bacon.combineAsArray(this, other)
      .map (values) ->
        combinator(values[0], values[1]))

Bacon.Observable :: decode = (cases) -> withDescription(this, "decode", cases, @combine(Bacon.combineTemplate(cases), (key, values) -> values[key]))

Bacon.Property :: and = (other) -> withDescription(this, "and", other, @combine(other, (x, y) -> x and y))

Bacon.Property :: or = (other) -> withDescription(this, "or", other, @combine(other, (x, y) -> x or y))
