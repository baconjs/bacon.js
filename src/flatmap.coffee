# build-dependencies: core, eventstream, once
# build-dependencies: functionconstruction
# build-dependencies: compositeunsubscribe

Bacon.Observable :: flatMap = ->
  flatMap_ this, makeSpawner(arguments)

Bacon.Observable :: flatMapFirst = ->
  flatMap_ this, makeSpawner(arguments), true

flatMap_ = (root, f, firstOnly, limit) ->
  rootDep = [root]
  childDeps = []
  result = new EventStream (new Bacon.Desc(root, "flatMap" + (if firstOnly then "First" else ""), [f])), (sink) ->
    composite = new CompositeUnsubscribe()
    queue = []
    spawn = (event) ->
      child = makeObservable(f event.value())
      childDeps.push(child)
      composite.add (unsubAll, unsubMe) -> child.dispatcher.subscribe (event) ->
        if event.isEnd()
          _.remove(child, childDeps)
          checkQueue()
          checkEnd(unsubMe)
          Bacon.noMore
        else
          if event instanceof Initial
            # To support Property as the spawned stream
            event = event.toNext()
          reply = sink event
          unsubAll() if reply == Bacon.noMore
          reply
    checkQueue = ->
      event = queue.shift()
      spawn event if event
    checkEnd = (unsub) ->
      unsub()
      sink endEvent() if composite.empty()
    composite.add (__, unsubRoot) -> root.dispatcher.subscribe (event) ->
      if event.isEnd()
        checkEnd(unsubRoot)
      else if event.isError()
        sink event
      else if firstOnly and composite.count() > 1
        Bacon.more
      else
        return Bacon.noMore if composite.unsubscribed
        if limit and composite.count() > limit
          queue.push(event)
        else
          spawn event
    composite.unsubscribe
  result.internalDeps = -> if (childDeps.length) then rootDep.concat(childDeps) else rootDep
  result

makeSpawner = (args) ->
  if args.length == 1 and isObservable(args[0])
    _.always(args[0])
  else
    makeFunctionArgs args

makeObservable = (x) ->
  if (isObservable(x))
    x
  else
    Bacon.once(x)
