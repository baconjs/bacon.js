import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, series, error } from "./util/SpecHelper";

describe("EventStream.errors", function() {
  describe("Includes errors only", () =>
    expectStreamEvents(
      () => series(1, [1, error(), 2]).errors(),
      [error()])
  );
  it("toString", () => expect(Bacon.never().errors().toString()).to.equal("Bacon.never().errors()"));
});
