import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, series, semiunstable, unstable, fromArray } from "./util/SpecHelper";

describe("EventStream.startWith", function() {
  describe("provides seed value, then the rest", () =>
    expectStreamEvents(
      function() {
        const left = series(1, [1, 2, 3]);
        return left.startWith(0);
      },
      [0, 1, 2, 3], semiunstable)
  );
  describe("works with synchronous source", () =>
    expectStreamEvents(
      function() {
        const left = fromArray([1, 2, 3]);
        return left.startWith(0);
      },
      [0, 1, 2, 3], semiunstable)
  );
  return it("toString", () => expect(Bacon.never().startWith(0).toString()).to.equal("Bacon.never().startWith(0)"));
});

describe("Property.startWith", function() {
  describe("starts with given value if the Property doesn't have an initial value", () =>
    expectPropertyEvents(
      function() {
        const left = series(1, [1, 2, 3]).toProperty();
        return left.startWith(0);
      },
      [0, 1, 2, 3], semiunstable)
  );
  describe("works with synchronous source", () =>
    expectPropertyEvents(
      function() {
        const left = fromArray([1, 2, 3]).toProperty();
        return left.startWith(0);
      },
      [0, 1, 2, 3], unstable)
  );
  describe("starts with the initial value of the Property if any", () =>
    expectPropertyEvents(
      function() {
        const left = series(1, [1, 2, 3]).toProperty(0);
        return left.startWith(9);
      },
      [0, 1, 2, 3], semiunstable)
  );
  return it("toString", () => expect(Bacon.constant(2).startWith(1).toString()).to.equal("Bacon.constant(2).startWith(1)"));
});
