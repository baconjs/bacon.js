import * as Bacon from "..";
import { expect } from "chai";
import { expectPropertyEvents, series, error, semiunstable, later, add } from "./util/SpecHelper";

describe("EventStream.flatScan", function() {
  const addAsync = (delay: number) => (prev: number, next: number) => later(delay, prev + next);
  describe("accumulates values with given seed and accumulator function which returns a stream of updated values", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).flatScan(0, addAsync(1)),
      [0, 1, 3, error(), 6])
  );

  describe.skip("beginning with the first source value successive values are accumulated values using the accumulator function which returns a stream of updated values", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).flatScan(addAsync(1)),
      [1, 3, error(), 6])
  );

  describe("Serializes updates even when they occur while performing previous update", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).flatScan(0, addAsync(5)),
      [0, error(), 1, 3, 6], semiunstable)
  );

  describe("Works also when f returns a constant value instead of an EventStream", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).flatScan(0, <any>add),
      [0, 1, 3, error(), 6], semiunstable)
  );

  describe("Works also when f returns a Property instead of an EventStream", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).flatScan(0, (prev, next) => Bacon.constant(prev + next)),
      [0, 1, 3, error(), 6], semiunstable)
  );

  return it("yields the seed value immediately", function() {
    const outputs: number[] = [];
    new Bacon.Bus().flatScan(0, (a, b) => <any>1).onValue(value => { outputs.push(value) });
    return expect(outputs).to.deep.equal([0]);
  });
});
