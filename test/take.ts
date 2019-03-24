import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, series, repeat, repeatedly, unstable, fromArray, t, once } from "./util/SpecHelper";

describe("EventStream.take", function() {
  describe("takes N first elements", () =>
    expectStreamEvents(
      () => series(1, [1,2,3,4]).take(2),
      [1,2])
  );
  describe("works with N=0", () =>
    expectStreamEvents(
      () => series(1, [1,2,3,4]).take(0),
      [])
  );
  describe("will stop properly even when exception thrown by subscriber", () =>
    expectStreamEvents(
      function() {
        const s = repeatedly(t(1), ["lol", "wut"]).take(2);
        s.onValue(function(value) {
          if (value === "lol") { throw "testing"; }
        }); // special string that will be catched by TickScheduler
        return s;
      },
      ["wut"], unstable)
  ); // the outputs don't really matter - it's just that the stream terminates normally
  describe("works with synchronous source", () =>
    expectStreamEvents(
      () => fromArray([1,2,3,4]).take(2),
      [1,2])
  );
  return it("toString", () => expect(Bacon.never().take(1).toString()).to.equal("Bacon.never().take(1)"));
});

describe("Property.take(1)", function() {
  describe("takes the Initial event", () =>
    expectPropertyEvents(
      () => series(1, [1,2,3]).toProperty(0).take(1),
      [0])
  );
  describe("takes the first Next event, if no Initial value", () =>
    expectPropertyEvents(
      () => series(1, [1,2,3]).toProperty().take(1),
      [1])
  );
  describe("works for constants", () =>
    expectPropertyEvents(
      () => Bacon.constant(1),
      [1])
  );
  return describe("works for never-ending Property", function() {
    expectPropertyEvents(
      () => repeat(1, [1,2,3]).toProperty(0).take(1),
      [0]);
    return expectPropertyEvents(
      () => repeat(1, [1,2,3]).toProperty().take(1),
      [1]);
  });
});

describe("Bacon.once().take(1)", () =>
  describe("works", () =>
    expectStreamEvents(
      () => once(1).take(1),
      [1])
  )
);
