# build-dependencies: _, source

class Desc
  _isDesc: true

  constructor: (@context, @method, @args) ->
  deps: ->
    @cached or= findDeps([@context].concat(@args))
  toString: ->
    _.toString(@context) + "." + _.toString(@method) + "(" + _.map(_.toString, @args) + ")"

describe = (context, method, args...) ->
  if (context or method)?._isDesc
    context or method
  else
    new Desc(context, method, args)

withDesc = (desc, obs) ->
  obs.desc = desc
  obs

findDeps = (x) ->
  if isArray(x)
    _.flatMap findDeps, x
  else if isObservable(x)
    [x]
  else if x?._isSource
    [x.obs]
  else
    []

Bacon.Desc = Desc
Bacon.Desc.empty = new Bacon.Desc("", "", [])
