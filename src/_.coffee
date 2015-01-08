_ = {
  indexOf: if Array :: indexOf
    (xs, x) -> xs.indexOf(x)
  else
    (xs, x) ->
      for y, i in xs
        return i if x == y
      -1
  indexWhere: (xs, f) ->
    for y, i in xs
      return i if f(y)
    -1
  head: (xs) -> xs[0]
  always: (x) -> (-> x)
  negate: (f) -> (x) -> !f(x)
  empty: (xs) -> xs.length == 0
  tail: (xs) -> xs[1...xs.length]
  filter: (f, xs) ->
    filtered = []
    for x in xs
      filtered.push(x) if f(x)
    filtered
  map: (f, xs) ->
    f(x) for x in xs
  each: (xs, f) ->
    for key, value of xs
      f(key, value)
    undefined
  toArray: (xs) -> if isArray(xs) then xs else [xs]
  contains: (xs, x) -> _.indexOf(xs, x) != -1
  id: (x) -> x
  last: (xs) -> xs[xs.length - 1]
  all: (xs, f = _.id) ->
    for x in xs
      return false unless f(x)
    return true
  any: (xs, f = _.id) ->
    for x in xs
      return true if f(x)
    return false
  without: (x, xs) ->
    _.filter(((y) -> y != x), xs)
  remove: (x, xs) ->
    i = _.indexOf(xs, x)
    if i >= 0
      xs.splice(i, 1)
  fold: (xs, seed, f) ->
    for x in xs
      seed = f(seed, x)
    seed
  flatMap: (f, xs) ->
    _.fold xs, [], ((ys, x) ->
      ys.concat(f(x)))
  cached: (f) ->
    value = None
    ->
      if value == None
        value = f()
        f = undefined
      value
  toString: (obj) ->
    try
      recursionDepth++
      unless obj?
        "undefined"
      else if isFunction(obj)
        "function"
      else if isArray(obj)
        return "[..]" if recursionDepth > 5
        "[" + _.map(_.toString, obj).toString() + "]"
      else if obj?.toString? and obj.toString != Object.prototype.toString
        obj.toString()
      else if (typeof obj == "object")
        return "{..}" if recursionDepth > 5
        internals = for own key of obj
          value = try
            obj[key]
          catch ex
            ex
          _.toString(key) + ":" + _.toString(value)
        "{" + internals + "}"
      else
        obj
    finally
      recursionDepth--
}

recursionDepth = 0

Bacon._ = _
