import * as Bacon from "..";

import { expectStreamEvents, series, unstable, semiunstable } from "./util/SpecHelper";

function flattenAndConcat<V>(obs: Bacon.EventStream<Bacon.EventStream<V>>) {
  return obs.flatMap((obs: Bacon.Observable<V>) =>
    obs.fold([], (xs: any, x: any) => xs.concat(x)))
}

function flattenAndMerge<V>(obs: Bacon.EventStream<Bacon.EventStream<V>>) {
  return obs.flatMap(Bacon._.id);
}

function takeWhileInclusive<V>(obs: Bacon.EventStream<V>, f: (v: V) => boolean) {
  return obs.transform(function(event: Bacon.Event<V>, sink: Bacon.EventSink<V>) {
    if (event.filter(f)) {
      return sink(event);
    } else {
      sink(event);
      sink(new Bacon.End());
      return Bacon.noMore;
    }
  })
}

function toString(x: number) {
  return x.toString()
}

describe("EventStream.groupBy", function() {
  describe("without limiting function (legacy support)", function() {
    expectStreamEvents(
      () => flattenAndConcat(series(2, [1,2,2,3,1,2,2,3]).groupBy(toString)),
      [[1,1],[2,2,2,2],[3,3]], unstable);
    return expectStreamEvents(
      () => flattenAndMerge(series(2, [1,2,2,3,1,2,2,3]).groupBy(toString)),
      [1,2,2,3,1,2,2,3], semiunstable);
  });
  describe("with limiting function", function() {
    expectStreamEvents(
      () => flattenAndConcat(series(2, [1,2,2,3,1,2,2,3]).groupBy(toString, x => x.take(2))),
      [[2,2],[1,1],[2,2],[3,3]], semiunstable);
    return expectStreamEvents(
      () => flattenAndMerge(series(2, [1,2,2,3,1,2,2,3]).groupBy(toString, x => x.take(2))),
      [1,2,2,3,1,2,2,3], semiunstable);
  });
  describe("when mapping all values to same key", () =>
    expectStreamEvents(
      () => flattenAndConcat(series(2, [1,2,2,3,1,2,2,3]).groupBy(x => "", Bacon._.id)),
      [[1,2,2,3,1,2,2,3]])
  );
  describe("when using accumulator function", function() {
    expectStreamEvents(
      () => flattenAndConcat(series(2, [1,2,2,3,1,2,2,3]).groupBy(toString, x => x.fold(0, (x,y) => x+y))),
      [[2], [8], [6]], unstable);
    return expectStreamEvents(
      () => flattenAndMerge(series(2, [1,2,2,3,1,2,2,3]).groupBy(toString, x => x.fold(0, (x,y) => x+y))),
      [2, 8, 6], unstable);
  });
  describe("scenario #402", () =>
    expectStreamEvents(
      () =>
        flattenAndConcat((series(2, [{k:1, t:"start"}, {k:2, t:"start"}, {k: 1, t:"data"}, {k: 1, t: "end"}, {k: 1, t: "start"}])
          .groupBy((x => x.k.toString()), x => takeWhileInclusive(x, x => x.t !== "end")))
        )
      ,
      [[{k:1, t:"start"}, {k: 1, t:"data"}, {k: 1, t:"end"}], [{k:2, t:"start"}], [{k:1, t:"start"}]], unstable)
  );
  describe("scenario calculating sums by continuous groups", function() {
    type Elem = {id: number, val?: number, type: string};
    const events: Elem[] = [
      {id: 1, val: 3, type: "add"},
      {id: 2, val: -1, type: "add"},
      {id: 1, val: 2, type: "add"},
      {id: 2, type: "cancel"},
      {id: 3, val: 2, type: "add"},
      {id: 3, type: "cancel"},
      {id: 1, val: 1, type: "add"},
      {id: 1, val: 2, type: "add"},
      {id: 1, type: "cancel"}
    ];
    return expectStreamEvents(
      function() {
        const keyF = (x: Elem) => x.id.toString();
        const limitF = function(stream: Bacon.EventStream<Elem>, origX: Elem) {
          const cancel = stream.filter(x => x.type === "cancel").take(1);
          const adds = stream.filter(x => x.type === "add");
          return adds.takeUntil(cancel).map(x => x.val || 0);
        };

        return series(2, events)
          .groupBy(keyF, limitF)
          .flatMap(groupStream => groupStream.fold(0, (acc, x) => acc + x));
      },
      [-1, 2, 8], semiunstable);
  });

  return describe("scenario #624", function() {
    type KeyEvent = { chan: number, type: string, key?: string }
    const events: KeyEvent[] = [
      {chan: 1, type: 'keydown', key: '4'},
      {chan: 1, type: 'keyup'},
      {chan: 2, type: 'keydown', key: '2'},
      {chan: 2, type: 'keyup'}
    ];
    function keyPresses(stream: Bacon.EventStream<KeyEvent>) {
      const down = stream.filter(i => i.type === 'keydown');
      const up = stream.filter(i => i.type === 'keyup');
      const upWithKey = down.flatMapLatest(downEvent =>
        up.take(1).map(function(upEvent: KeyEvent) {
          upEvent.key = downEvent.key;
          return upEvent;
        })
      );
      return down.merge(upWithKey);
    };
    return expectStreamEvents(
      () => series(2, events).groupBy(i => i.chan.toString(), Bacon._.id).map(keyPresses).flatMap(s => s).map(i => i.type + i.key),
      ['keydown4', 'keyup4', 'keydown2', 'keyup2'], semiunstable);
  });
});

describe("Property.groupBy", () =>
  describe("without limiting function", () =>
    expectStreamEvents(
      () => flattenAndConcat(series(2, [1,2,2,3,1,2,2,3]).toProperty().groupBy(toString, Bacon._.id).toEventStream()),
      [[1,1],[2,2,2,2],[3,3]], unstable)
  )
);
