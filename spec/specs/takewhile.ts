import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, error, lessThan, fromArray, series, repeat } from "./util/SpecHelper";

describe("EventStream.takeWhile", function() {
  describe("takes while predicate is true", () =>
    expectStreamEvents(
      () => repeat(1, [1, error("wat"), 2, 3]).takeWhile(lessThan(3)),
      [1, error("wat"), 2])
  );
  describe("can filter by Property value", () =>
    expectStreamEvents(
      function() {
        const src = series(1, [1,1,2,3,4,4,8,7]);
        const odd = src.map(x => x % 2 > 0).toProperty();
        return src.takeWhile(odd);
      },
      [1,1])
  );
  describe("works with synchronous source", () =>
    expectStreamEvents(
      () => fromArray([1, 2, 3]).takeWhile(lessThan(3)),
      [1, 2])
  );
  return it("toString", () => expect(Bacon.never().takeWhile(() => true).toString()).to.equal("Bacon.never().takeWhile(function)"));
});


describe("Property.takeWhile", function() {
  describe("takes while predicate is true", () =>
    expectPropertyEvents(
      () =>
        series(1, [1, error("wat"), 2, 3])
          .toProperty().takeWhile(lessThan(3))
      ,
      [1, error("wat"), 2])
  );
  describe("can filter by Property value", () =>
    expectPropertyEvents(
      function() {
        const src = series(1, [1,1,2,3,4,4,8,7]).toProperty();
        const odd = src.map(x => x % 2 > 0);
        return src.takeWhile(odd);
      },
      [1,1])
  );
  return describe("works with never-ending Property", () =>
    expectPropertyEvents(
      () =>
        repeat(1, [1, error("wat"), 2, 3])
          .toProperty().takeWhile(lessThan(3))
      ,
      [1, error("wat"), 2])
  );
});