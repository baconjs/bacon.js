import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectStreamTimings, expectPropertyEvents, series, error, later, semiunstable, unstable, range } from "./util/SpecHelper";

describe("EventStream.holdWhen", function() {
  describe("Keeps events on hold when a property is true", () =>
    expectStreamTimings(
      function() {
        const src = series(2, [1,2,3,4]);
        const valve = series(2, [true, false, true, false]).delay(1).toProperty();
        return src.holdWhen(valve);
      },
      [[2, 1], [5, 2], [6, 3], [9, 4]], semiunstable)
  );
  describe("Holds forever when the property ends with truthy value", () =>
    expectStreamTimings(
      function() {
        const src = series(2, [1,2,3,4]);
        const valve = series(2, [true, false, true]).delay(1).toProperty();
        return src.holdWhen(valve);
      },
      [[2, 1], [5, 2], [6, 3]], semiunstable)
  );
  describe("Ends properly with never-ending valve", () =>
    expectStreamEvents(
      function() {
        const valve = new Bacon.Bus();
        return series(2, [1,2,3]).holdWhen(<any>valve);
      },
      [1,2,3])
  );
  describe("Supports truthy init value for property", () =>
    expectStreamTimings(
      function() {
        const src = series(2, [1,2]);
        const valve = series(2, [false]).delay(1).toProperty(true);
        return src.holdWhen(valve);
      },
      [[3, 1], [4, 2]], semiunstable)
  );
  describe("Works with array values", () =>
    expectStreamEvents(
      () =>
        Bacon.interval(1000, [1,2]).
          holdWhen(Bacon.later(1000, false).toProperty(true)).
            take(1)
      ,
      [[1, 2]])
  );

  describe("Doesn't crash when flushing huge buffers", function() {
    const count = 6000;
    return expectPropertyEvents(
      function() {
        const source = series(1, range(1, count, true));
        const flag = source.map(x => x !== (count-1)).toProperty(true);
        return source.holdWhen(flag).fold(0, ((x,y) => x+1));
      },
      [count-1]);
  });
  describe("Works with synchronous sources", () =>
    expectStreamTimings(
      () =>
        Bacon.once("2").
          holdWhen(Bacon.later(1000, false).toProperty(true))
      ,
      [[1000, "2"]])
  );
  describe("Works with synchronous sources, case 2", () =>
    expectStreamTimings(
      () =>
        Bacon.once(2).
          holdWhen(<any>Bacon.once(true))
      ,
      [])
  );
  describe("Works with synchronous sources, case 3", () =>
    expectStreamTimings(
      () =>
        Bacon.once("2").
          holdWhen(Bacon.constant(false))
      ,
      [[0, "2"]])
  );
  describe("Works with synchronous sources, case 4", () =>
    expectStreamTimings(
      () =>
        Bacon.fromArray([error(), "2"]).
          holdWhen(<any>later(20, false).startWith(true))
      ,
      [error(), [20, "2"]])
  );
  describe("Sends the entire buffer even if valve ends", () =>
    expectStreamEvents(
      function() {
        const left = series(1, [1, 2, 3, 4, 5]);
        const bufferedRight = series(1, [6, 7, 8, 9, 10]).
            holdWhen(<any>left.map(true).startWith(true).mapEnd(false));
        return left.merge(bufferedRight);
      },
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], unstable)
  );
  describe("Sends the entire buffer even if valve ends, case 2", () =>
    expectStreamEvents(
      function() {
        const left = series(2, [1, 2, 3]);
        const bufferedRight = series(1, [4, 5, 6]).
            holdWhen(<any>left.map(true).startWith(true).mapEnd(false));
        return left.merge(bufferedRight);
      },
      [1, 2, 3, 4, 5, 6], unstable)
  );
  describe("Ends after flush if source has ended while holding, with never-ending valve", () =>
    expectStreamEvents(
      function() {
        const src = series(2, [1, 2]);
        const valveSource = later(5, false).startWith(true);
        const valve = new Bacon.Bus();
        valve.plug(valveSource);
        return src.holdWhen(<any>valve);
      },
      [1, 2], unstable)
  );

  describe("In combination with .toProperty", () =>
    expectPropertyEvents(
      () => later(1,1).holdWhen(Bacon.constant(false)).toProperty(0),
      [0,1])
  );
  return it("toString", () =>
    expect(Bacon.once(1).holdWhen(Bacon.constant(true)).toString()).to.equal(
      "Bacon.once(1).holdWhen(Bacon.constant(true))")
  );
});