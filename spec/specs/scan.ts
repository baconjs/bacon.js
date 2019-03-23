import * as Bacon from "../..";
import { expect } from "chai";

import { expectPropertyEvents, error, series, unstable, add, fromArray, once } from "./util/SpecHelper";

describe("EventStream.scan", function() {
  describe("accumulates values with given seed and accumulator function, passing through errors", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).scan(0, add),
      [0, 1, 3, error(), 6])
  );
  it("yields the seed value immediately", function() {
    const outputs: number[] = [];
    const bus = new Bacon.Bus();
    bus.scan(0, () => 1).onValue(value => { outputs.push(value) });
    expect(outputs).to.deep.equal([0]);
  });
  describe("yields null seed value", () =>
    expectPropertyEvents(
      () => series(1, [1]).scan(null, () => 1),
      [null, 1])
  );
  describe("works with synchronous streams", () =>
    expectPropertyEvents(
      () => fromArray([1,2,3]).scan(0, ((x,y)=> x+y)),
      [0,1,3,6], unstable)
  );
  describe("works with merged synchronous streams", () =>
    expectPropertyEvents(
      () => Bacon.mergeAll(once(1), once(2)).scan(0, (a,b) => a+b),
      [0,1,3], unstable)
  );
  describe("works with functions as values", () =>
    expectPropertyEvents(
      () => series(1, [(() => 1), (() => 2)]).scan((() => 0), (a, b) => b).map(f => f()),
    [0, 1, 2])
  );
  describe("calls accumulator function once per value", function() {
    describe("(simple case)", function() {
      let count = 0;
      expectPropertyEvents(
        () => series(2, [1,2,3]).scan(0, function(x,y) { count++; return x + y; }),
        [0, 1, 3, 6],
        { extraCheck() { return it("calls accumulator once per value", () => expect(count).to.equal(3)); }}
      );
    });
    it("(when pushing to Bus in accumulator)", function() {
      let count = 0;
      const someBus = new Bacon.Bus<null>();
      someBus.onValue(function() {});
      const src = new Bacon.Bus<null>();
      const result = src.scan(0, function(_) {
        someBus.push(null);
        return count++;
      });
      result.onValue();
      result.onValue();
      src.push(null);
      expect(count).to.equal(1);
    });
  });
});

describe("Property.scan", function() {
  describe("with Init value, starts with f(seed, init)", () =>
    expectPropertyEvents(
      () => series(1, [2,3]).toProperty(1).scan(0, add),
      [1, 3, 6])
  );
  describe("without Init value, starts with seed", () =>
    expectPropertyEvents(
      () => series(1, [2,3]).toProperty().scan(0, add),
      [0, 2, 5])
  );
  describe("treats null seed value like any other value", function() {
    expectPropertyEvents(
      () => series(1, [1]).toProperty().scan(null, add),
      [null, 1]);
    expectPropertyEvents(
      () => series(1, [2]).toProperty(1).scan(null, add),
      [1, 3]);
  });
  describe("for synchronous source", function() {
    describe("with Init value, starts with f(seed, init)", () =>
      expectPropertyEvents(
        () => fromArray([2,3]).toProperty(1).scan(0, add),
        [1, 3, 6], unstable)
    );
    describe("without Init value, starts with seed", () =>
      expectPropertyEvents(
        () => fromArray([2,3]).toProperty().scan(0, add),
        [0, 2, 5], unstable)
    );
    describe("works with synchronously responding empty source", () =>
      expectPropertyEvents(
        () => Bacon.never().toProperty(1).scan(0, add),
        [1])
    );
  });
});
