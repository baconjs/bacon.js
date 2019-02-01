import * as Bacon from "../..";
import { expect } from "chai";

import { 
  expectStreamEvents,
  expectPropertyEvents,
  series,
  repeat,
  semiunstable,
  error,
  later,
  sc,
  map,
  mergeAll,
  take,
  lessThan,
  fromArray,
  t,
  once,
  deferred,
  onUnsub
} from "./util/SpecHelper";

describe("EventStream.takeUntil", () => {
  describe("takes elements from source until an event appears in the other stream", () =>
    expectStreamEvents(
      function() {
        const src = repeat(3, [1, 2, 3]);
        const stopper = repeat(7, ["stop!"]);
        return src.takeUntil(stopper);
      },
      [1, 2], semiunstable)
  );
  describe("works on self-derived stopper", () =>
    expectStreamEvents(
      function() {
        const src = repeat(3, [3, 2, 1]);
        const stopper = src.filter(lessThan(3));
        return src.takeUntil(stopper);
      },
      [3])
  );
  describe("works on self-derived stopper with an evil twist", () =>
    expectStreamEvents(
      function() {
        const src = repeat(3, [3, 2, 1]);
        const data = map(src, (x: any) => x);
        take(3, data).onValue(() => Bacon.more);
        const stopper = src.filter(lessThan(3));
        return data.takeUntil(stopper);
      },
      [3])
  );
  describe("includes source errors, ignores stopper errors", () =>
    expectStreamEvents(
      function() {
        const src = repeat(2, [1, error(), 2, 3]);
        const stopper = mergeAll(repeat(7, ["stop!"]), repeat(1, [error()]));
        return src.takeUntil(stopper);
      },
      [1, error(), 2], semiunstable)
  );
  describe("works with Property as stopper", () =>
    expectStreamEvents(
      function() {
        const src = repeat(3, [1, 2, 3]);
        const stopper = repeat(7, ["stop!"]).toProperty();
        return src.takeUntil(stopper);
      },
      [1, 2], semiunstable)
  );
  describe("considers Property init value as stopper", () =>
    expectStreamEvents(
      function() {
        const src = repeat(3, [1, 2, 3]);
        const stopper = Bacon.constant("stop");
        return src.takeUntil(stopper);
      },
      [])
  );
  describe("ends immediately with synchronous stopper", () =>
    expectStreamEvents(
      function() {
        const src = repeat(3, [1, 2, 3]);
        const stopper = once("stop");
        return src.takeUntil(stopper);
      },
      [])
  );
  describe("ends properly with a never-ending stopper", () =>
    expectStreamEvents(
      function() {
        const src = series(1, [1,2,3]);
        const stopper = new Bacon.Bus();
        return src.takeUntil(stopper);
      },
      [1,2,3])
  );
  describe("ends properly with a never-ending stopper and synchronous source", () =>
    expectStreamEvents(
      function() {
        const src = fromArray<number|string>([1,2,3]).mapEnd("finito");
        const stopper = new Bacon.Bus();
        return src.takeUntil(stopper);
      },
      [1,2,3, "finito"])
  );
  describe("unsubscribes its source as soon as possible", () =>
     expectStreamEvents(
       function() {
        const startTick = sc.now();
        return onUnsub(later(20), () => expect(sc.now()).to.equal(startTick + 1))
        .takeUntil(later(1));
      },
      [])
  );
  describe("it should unsubscribe its stopper on end", () =>
     expectStreamEvents(
       function() {
         const startTick = sc.now();
         return later(1,'x').takeUntil(onUnsub(later(20), () => expect(sc.now()).to.equal(startTick + 1)));
       },
       ['x'])
  );
  describe("it should unsubscribe its stopper on no more", () =>
     expectStreamEvents(
       function() {
         const startTick = sc.now();
         return later(1,'x').takeUntil(onUnsub(later(20), () => expect(sc.now()).to.equal(startTick + 1)));
       },
       ['x'])
  );
  /* TODO does not pass
  describe "works with synchronous self-derived sources", ->
    expectStreamEvents(
      ->
        a = Bacon.fromArray [1,2]
        b = a.filter((x) -> x >= 2)
        a.takeUntil b
      [1])
  */
  it("toString", () => expect(Bacon.never().takeUntil(Bacon.never()).toString()).to.equal("Bacon.never().takeUntil(Bacon.never())"));
});

describe("Property.takeUntil", () => {
  describe("takes elements from source until an event appears in the other stream", () =>
    expectPropertyEvents(
      () => series(2, [1,2,3]).toProperty().takeUntil(later(t(3), 1)),
      [1])
  );
  describe("works with errors", () =>
    expectPropertyEvents(
      function() {
        const src = repeat(2, [1, error(), 3]);
        const stopper = repeat(5, ["stop!"]);
        return src.toProperty(0).takeUntil(stopper);
      },
      [0, 1, error()], semiunstable)
  );
  it("works with synchronous error (fix #447)", () => {
    const errors: string[] = [];
    once(new Bacon.Error("fail")).toProperty()
      .takeUntil(Bacon.never())
      .onError(e => {
        errors.push(e)
        return Bacon.more
      });
    deferred(() => expect(errors).to.deep.equal(["fail"]));
  });
  it("toString", () => expect(Bacon.constant(1).takeUntil(Bacon.never()).toString()).to.equal("Bacon.constant(1).takeUntil(Bacon.never())"));
});
