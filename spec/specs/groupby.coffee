# build-dependencies: flatMap, fold, concat, take, takeWhile, takeUntil, map, flatMapLatest, filter, merge

describe "EventStream.groupBy", ->
  flattenAndConcat = (obs) ->
    obs.flatMap((obs) ->
      obs.fold([], (xs,x) ->
        xs.concat(x)))

  flattenAndMerge = (obs) ->
    obs.flatMap(Bacon._.id)

  takeWhileInclusive = (obs, f) ->
    obs.withHandler (event) ->
      if event.filter(f)
        @push event
      else
        @push event
        @push new Bacon.End()
        Bacon.noMore

  describe "without limiting function", ->
    expectStreamEvents(
      ->
        flattenAndConcat series(2, [1,2,2,3,1,2,2,3]).groupBy(Bacon._.id)
      [[1,1],[2,2,2,2],[3,3]], unstable)
    expectStreamEvents(
      ->
        flattenAndMerge series(2, [1,2,2,3,1,2,2,3]).groupBy(Bacon._.id)
      [1,2,2,3,1,2,2,3], semiunstable)
  describe "with limiting function", ->
    expectStreamEvents(
      ->
        flattenAndConcat series(2, [1,2,2,3,1,2,2,3]).groupBy(Bacon._.id, (x) -> x.take(2))
      [[2,2],[1,1],[2,2],[3,3]], semiunstable)
    expectStreamEvents(
      ->
        flattenAndMerge series(2, [1,2,2,3,1,2,2,3]).groupBy(Bacon._.id, (x) -> x.take(2))
      [1,2,2,3,1,2,2,3], semiunstable)
  describe "when mapping all values to same key", ->
    expectStreamEvents(
      ->
        flattenAndConcat series(2, [1,2,2,3,1,2,2,3]).groupBy((x) -> "")
      [[1,2,2,3,1,2,2,3]])
  describe "when using accumulator function", ->
    expectStreamEvents(
      ->
        flattenAndConcat series(2, [1,2,2,3,1,2,2,3]).groupBy(Bacon._.id, (x) -> x.fold(0, (x,y) -> x+y))
      [[2], [8], [6]], unstable)
    expectStreamEvents(
      ->
        flattenAndMerge series(2, [1,2,2,3,1,2,2,3]).groupBy(Bacon._.id, (x) -> x.fold(0, (x,y) -> x+y))
      [2, 8, 6], unstable)
  describe "scenario #402", ->
    expectStreamEvents(
      ->
        flattenAndConcat (series(2, [{k:1, t:"start"}, {k:2, t:"start"}, {k: 1, t:"data"}, {k: 1, t: "end"}, {k: 1, t: "start"}])
          .groupBy(((x) -> x.k), (x) -> takeWhileInclusive x, (x) -> x.t != "end"))
      [[{k:1, t:"start"}, {k: 1, t:"data"}, {k: 1, t:"end"}], [{k:2, t:"start"}], [{k:1, t:"start"}]], unstable)
  describe "scenario #624", ->
    events = [
      {chan: 1, type: 'keydown', key: '4'},
      {chan: 1, type: 'keyup'},
      {chan: 2, type: 'keydown', key: '2'},
      {chan: 2, type: 'keyup'}
    ]
    keyPresses = (stream) ->
      down = stream.filter((i) -> i.type == 'keydown')
      up = stream.filter((i) -> i.type == 'keyup')
      upWithKey = down.flatMapLatest (downEvent) ->
        up.take(1).map (upEvent) ->
          upEvent.key = downEvent.key
          upEvent
      down.merge(upWithKey)
    expectStreamEvents(
      ->
        series(2, events).groupBy((i) -> i.chan).map(keyPresses).flatMap(Bacon._.id).map((i) -> i.type + i.key)
      ['keydown4', 'keyup4', 'keydown2', 'keyup2'], semiunstable)

  describe "scenario calculating sums by continuous groups", ->
    events = [
      {id: 1, val: 3, type: "add"},
      {id: 2, val: -1, type: "add"},
      {id: 1, val: 2, type: "add"},
      {id: 2, type: "cancel"},
      {id: 3, val: 2, type: "add"},
      {id: 3, type: "cancel"},
      {id: 1, val: 1, type: "add"},
      {id: 1, val: 2, type: "add"},
      {id: 1, type: "cancel"}
    ]
    expectStreamEvents(
      ->
        keyF = (x) -> x.id
        limitF = (stream, origX) ->
          cancel = stream.filter((x) -> x.type == "cancel").take(1)
          adds = stream.filter((x) -> x.type == "add")
          adds.takeUntil(cancel).map(".val")

        series(2, events)
          .groupBy(keyF, limitF)
          .flatMap((groupStream) -> groupStream.fold(0, (acc, x) -> acc + x))
      [-1, 2, 8], semiunstable)
