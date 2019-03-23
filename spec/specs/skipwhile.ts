import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, error, series, fromArray, lessThan } from "./util/SpecHelper";

describe("EventStream.skipWhile", function() {
  describe("skips filter predicate holds true", () =>
    expectStreamEvents(
      () => series(1, [1, error(), 2, error(), 3, 2]).skipWhile(lessThan(3)),
      [error(), error(), 3, 2])
  );
  describe("can filter by Property value", () =>
    expectStreamEvents(
      function() {
        const src = series(1, [1,1,2,3,4,4,8,7]);
        const odd = src.map(x => x % 2 > 0).toProperty();
        return src.skipWhile(odd);
      },
      [2,3,4,4,8,7])
  );
  describe("for synchronous sources", () =>
    describe("skips filter predicate holds true", () =>
      expectStreamEvents(
        () => fromArray([1, 2, 3, 2]).skipWhile(lessThan(3)),
        [3, 2])
    )
  );
  return it("toString", () => expect(Bacon.never().skipWhile(true).toString()).to.equal("Bacon.never().skipWhile(true)"));
});