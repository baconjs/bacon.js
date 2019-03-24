import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, series, error } from "./util/SpecHelper";

const times2 = (x: number) => x * 2;

describe("Property.map", () =>
  describe("maps property values", () =>
    expectPropertyEvents(
      () => series(1, [2, error()]).toProperty(1).map(times2),
      [2, 4, error()])
  )
);

describe("EventStream.map", function() {
  describe("should map with given function", () =>
    expectStreamEvents(
      () => series(1, [1, 2, 3]).map(times2),
      [2, 4, 6])
  );
  describe("also accepts a constant value", () =>
    expectStreamEvents(
      () => series(1, [1, 2, 3,]).map("lol"),
      ["lol", "lol", "lol"])
  );
  describe("can map to a Property value", () =>
    expectStreamEvents(
      () => series(1, [1,2,3]).map(Bacon.constant(2)),
      [2,2,2])
  );
  return it("toString", () => expect(Bacon.never().map(true).toString()).to.equal("Bacon.never().map(true)"));
});
