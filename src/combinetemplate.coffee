# build-dependencies: combine

Bacon.combineTemplate = (template) ->
  funcs = []
  streams = []
  current = (ctxStack) -> ctxStack[ctxStack.length - 1]
  setValue = (ctxStack, key, value) -> current(ctxStack)[key] = value
  applyStreamValue = (key, index) -> (ctxStack, values) -> setValue(ctxStack, key, values[index])
  constantValue = (key, value) -> (ctxStack) -> setValue(ctxStack, key, value)
  mkContext = (template) -> if isArray(template) then [] else {}
  pushContext = (key, value) -> (ctxStack) ->
    newContext = mkContext(value)
    setValue(ctxStack, key, newContext)
    ctxStack.push(newContext)
  compile = (key, value) ->
    if (isObservable(value))
      streams.push(value)
      funcs.push(applyStreamValue(key, streams.length - 1))
    else if (value == Object(value) and typeof value != "function" and !(value instanceof RegExp) and !(value instanceof Date))
      popContext = (ctxStack) -> ctxStack.pop()
      funcs.push(pushContext(key, value))
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
  withDesc(new Bacon.Desc(Bacon, "combineTemplate", [template]), Bacon.combineAsArray(streams).map(combinator))
