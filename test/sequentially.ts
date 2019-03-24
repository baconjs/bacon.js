import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, error, t, unstable, take } from "./util/SpecHelper";

describe("Bacon.sequentially", function() {
  describe("should send given events and end", () =>
    expectStreamEvents(
      () => Bacon.sequentially(t(1), ["lol", "wut"]),
      ["lol", "wut"])
  );
  describe("include error events", () =>
    expectStreamEvents(
      () => Bacon.sequentially(t(1), [error(), "lol"]),
      [error(), "lol"])
  );
  describe("will stop properly even when exception thrown by subscriber", () =>
    expectStreamEvents(
      function() {
        const s = Bacon.sequentially(t(1), ["lol", "wut"]);
        take(1, s).onValue(function(value) {
          throw "testing";
        }); // special string that will be catched by TickScheduler
        return s;
      },
      ["wut"], unstable)
  ); // the outputs don't really matter - it's just that the stream terminates normally
  it("toString", () => expect(Bacon.sequentially(1, [2]).toString()).to.equal("Bacon.sequentially(1,[2])"));
});
