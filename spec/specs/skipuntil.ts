import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, series } from "./util/SpecHelper";

describe("EventStream.skipUntil", function() {
  describe("skips events until one appears in given starter stream", () =>
    expectStreamEvents(
      function() {
        const src = series(3, [1,2,3]);
        src.onValue(function() {}); // to start "time" immediately instead of on subscribe
        const starter = series(4, ["start"]);
        return src.skipUntil(starter);
      },
      [2,3])
  );
  describe("works with self-derived starter", () =>
    expectStreamEvents(
      function() {
        const src = series(3, [1,2,3]);
        const starter = src.filter(x => x === 3);
        return src.skipUntil(starter);
      },
      [3])
  );
  describe("works with self-derived starter with an evil twist", () =>
    expectStreamEvents(
      function() {
        const src = series(3, [1,2,3]);
        const data = src.map(x => x);
        data.onValue(function() {});
        const starter = src.filter(x => x === 3);
        return data.skipUntil(starter);
      },
      [3])
  );
  it("toString", () => expect(Bacon.never().skipUntil(Bacon.once(1)).toString()).to.equal("Bacon.never().skipUntil(Bacon.once(1))"));
});
