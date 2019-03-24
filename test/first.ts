import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, semiunstable, fromArray, series, repeat, repeatedly, t, once } from "./util/SpecHelper";

describe("EventStream.first", function() {
  describe("takes the first element", () =>
    expectStreamEvents(
      () => series(1, [1,2,3,4]).first(),
      [1])
  );
  describe("works with empty stream", () =>
    expectStreamEvents(
      () => series(1, []).first(),
      [])
  );
  describe.skip("will stop properly even when exception thrown by subscriber", () =>
    expectStreamEvents(
      function() {
        // skipped because hangs
        const s = repeatedly(t(1), ["lol", "wut"]).first();
        s.onValue((value: string) => {
          if (value === "lol") { throw "testing"; }
          return undefined
        }); // special string that will be catched by TickScheduler
        return s;
      },
      ["lol"], semiunstable)
  ); // the outputs don't really matter - it's just that the stream terminates normally
  describe("works with synchronous source", () =>
    expectStreamEvents(
      () => fromArray([1,2,3,4]).first(),
      [1])
  );
  it("toString", () => expect(Bacon.never().first().toString()).to.equal("Bacon.never().first()"));
});

describe("Property.first()", function() {
  describe("takes the Initial event", () =>
    expectPropertyEvents(
      () => series(1, [1,2,3]).toProperty(0).first(),
      [0])
  );
  describe("takes the first Next event, if no Initial value", () =>
    expectPropertyEvents(
      () => series(1, [1,2,3]).toProperty().first(),
      [1])
  );
  describe("works for constants", () =>
    expectPropertyEvents(
      () => Bacon.constant(1),
      [1])
  );
  describe("works for never-ending Property", function() {
    expectPropertyEvents(
      () => repeat(1, [1,2,3]).toProperty(0).first(),
      [0]);
    expectPropertyEvents(
      () => repeat(1, [1,2,3]).toProperty().first(),
      [1]);
  });
  it("toString", () => expect(Bacon.constant(0).first().toString()).to.equal("Bacon.constant(0).first()"));
});

describe("Bacon.once().first()", () =>
  describe("works", () =>
    expectStreamEvents(
      () => once(1).first(),
      [1])
  )
);
