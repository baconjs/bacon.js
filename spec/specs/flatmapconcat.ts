import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, semiunstable, error, series, t } from "./util/SpecHelper";

describe("EventStream.flatMapConcat", function() {
  describe("is like flatMapWithConcurrencyLimit(1)", () =>
    expectStreamEvents(
      () => series(1, [1, 2]).flatMapConcat(value => series(t(2), [value, error(), value])) ,
      [1, error(), 1, 2, error(), 2], semiunstable)
  );
  it("toString", () => expect(Bacon.once(1).flatMapConcat(function() {}).toString()).to.equal("Bacon.once(1).flatMapConcat(function)"));
});
