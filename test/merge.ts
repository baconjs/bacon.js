import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, series, repeat, error, t, lessThan, semiunstable, unstable, once, fromArray } from "./util/SpecHelper";

describe("EventStream.merge", function() {
  describe("merges two streams and ends when both are exhausted", () =>
    expectStreamEvents(
      function() {
        const left = series(1, [1, error(), 2, 3]);
        const right = series(1, [4, 5, 6]).delay(t(4));
        return left.merge(right);
      },
      [1, error(), 2, 3, 4, 5, 6], semiunstable)
  );
  describe("respects subscriber return value", () =>
    expectStreamEvents(
      function() {
        const left = repeat(2, [1, 3]).take(3);
        const right = repeat(3, [2]).take(3);
        return left.merge(right).takeWhile(lessThan(2));
      },
      [1])
  );
  describe("does not duplicate same error from two streams", () =>
    expectStreamEvents(
      function() {
        const src = series(1, [1, error(), 2, error(), 3]);
        const left = src.map(x => x);
        const right = src.map(x => x * 2);
        return left.merge(right);
      },
      [1, 2, error(), 2, 4, error(), 3, 6], unstable)
  );
  describe("works with synchronous sources", () =>
    expectStreamEvents(
      () => fromArray([1,2]).merge(fromArray([3,4])),
      [1,2,3,4])
  );
  return it("toString", () => expect(Bacon.never().merge(Bacon.never()).toString()).to.equal("Bacon.never().merge(Bacon.never())"));
});

describe("Bacon.mergeAll", function() {
  describe(("merges all given streams"), () =>
    expectStreamEvents(
      () =>
        Bacon.mergeAll([
          series(3, [1, 2]),
          series(3, [3, 4]).delay(t(1)),
          series(3, [5, 6]).delay(t(2))])
      ,
      [1, 3, 5, 2, 4, 6], semiunstable)
  );
  describe(("supports n-ary syntax"), () =>
    expectStreamEvents(
      () =>
        Bacon.mergeAll(
          series(3, [1, 2]),
          series(3, [3, 4]).delay(t(1)),
          series(3, [5, 6]).delay(t(2)))
      ,
      [1, 3, 5, 2, 4, 6], semiunstable)
  );
  describe("works with a single stream", function() {
    expectStreamEvents(
      () => Bacon.mergeAll([once(1)]),
      [1]);
    return expectStreamEvents(
      () => Bacon.mergeAll(once(1)),
      [1]);
  });
  describe("returns empty stream for zero input", function() {
    expectStreamEvents(
      () => Bacon.mergeAll([]),
      []);
    return expectStreamEvents(
      () => Bacon.mergeAll(),
      []);
  });
  return it("toString", () => expect(Bacon.mergeAll(Bacon.never()).toString()).to.equal("Bacon.mergeAll(Bacon.never())"));
});
