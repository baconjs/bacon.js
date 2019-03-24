import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, series, error } from "./util/SpecHelper";

describe("EventStream.mapEnd", function() {
  describe("produces an extra element on stream end", () =>
    expectStreamEvents(
      () => series(1, ["1", error()]).mapEnd("the end"),
      ["1", error(), "the end"])
  );
  describe("accepts either a function or a constant value", () =>
    expectStreamEvents(
      () => series(1, ["1", error()]).mapEnd(() => "the end"),
      ["1", error(), "the end"])
  );
  return it("toString", () => expect(Bacon.never().mapEnd(true).toString()).to.equal("Bacon.never().mapEnd(true)"));
});
