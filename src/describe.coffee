# build-dependencies: _, source

class Desc
  constructor: (@context, @method, @args) ->
  deps: ->
    @cached or= findDeps([@context].concat(@args))
  apply: (obs) ->
    obs.desc = this
    obs
  toString: ->
    _.toString(@context) + "." + _.toString(@method) + "(" + _.map(_.toString, @args) + ")"

describe = (context, method, args...) ->
  if (context or method) instanceof Desc
    context or method
  else
    new Desc(context, method, args)

withDescription = (desc..., obs) ->
  describe(desc...).apply(obs)

findDeps = (x) ->
  if isArray(x)
    _.flatMap findDeps, x
  else if isObservable(x)
    [x]
  else if x instanceof Source
    [x.obs]
  else
    []
