import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, series, fromArray, later } from "./util/SpecHelper";

describe("Bacon.groupSimultaneous", function() {
  describe("groups simultaneous values in to arrays", () =>
    expectStreamEvents(
      function() {
        const src = series(1, [1,2]);
        const stream = src.merge(src.map(x => x * 2));
        return Bacon.groupSimultaneous(stream);
      },
      [[[1, 2]], [[2,4]]])
  );
  describe("groups simultaneous values from multiple sources in to arrays", () =>
    expectStreamEvents(
      function() {
        const src = series(1, [1,2]);
        const stream = src.merge(src.map(x => x * 2));
        const stream2 = src.map(x => x * 4);
        return Bacon.groupSimultaneous(stream, stream2);
      },
      [[[1, 2], [4]], [[2,4], [8]]])
  );
  describe("accepts an array or multiple args", () =>
    expectStreamEvents(
      () => Bacon.groupSimultaneous([later(1, 1), later(2, 2)]),
      [[[1],[]], [[], [2]]])
  );
  describe("returns empty stream for zero sources", function() {
    expectStreamEvents(
      () => Bacon.groupSimultaneous(),
      []);
    return expectStreamEvents(
      () => Bacon.groupSimultaneous([]),
      []);
  });
  describe("works with synchronous sources", function() {
      expectStreamEvents(
        () => Bacon.groupSimultaneous(fromArray([1,2])),
        [[[1]], [[2]]]);
      return expectStreamEvents(
        () => Bacon.groupSimultaneous(fromArray([1,2]).mapEnd(3)),
        [[[1]], [[2]], [[3]]]);
  });
  return it("toString", () => expect(Bacon.groupSimultaneous(Bacon.never()).toString()).to.equal("Bacon.groupSimultaneous(Bacon.never())"));
});
