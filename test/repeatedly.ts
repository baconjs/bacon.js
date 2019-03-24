import * as Bacon from "..";
import { expect } from "chai";
import { expectStreamEvents, take } from "./util/SpecHelper";

describe("Bacon.repeatedly", function() {
  describe("repeats given sequence forever", () =>
    expectStreamEvents(
      () => take(5, Bacon.repeatedly(1, [1,2])),
      [1,2,1,2,1])
  );
  return it("toString", () => expect(Bacon.repeatedly(1, [1]).toString()).to.equal("Bacon.repeatedly(1,[1])"));
});
