import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, semiunstable, unstable, error, fromArray, series, t, later } from "./util/SpecHelper";

describe("EventStream.flatMap", function() {
  describe("should spawn new stream for each value and collect results into a single stream", () =>
    expectStreamEvents(
      () => series(1, [1, 2]).flatMap(value => series(t(2), [value, error(), value])) ,
      [1, 2, error(), error(), 1, 2], semiunstable)
  );
  describe("should pass source errors through to the result", () =>
    expectStreamEvents(
      () => series(1, [error(), 1]).flatMap(value => later(t(1), value)) ,
      [error(), 1])
  );
  describe("should work with a spawned stream responding synchronously", function() {
    expectStreamEvents(
      () => series(1, [1, 2]).flatMap(value => Bacon.never().concat(Bacon.once(value))) ,
      [1, 2], unstable);
    expectStreamEvents(
      () => series(1, [1,2]).flatMap(value => Bacon.never().concat(Bacon.once(value)).concat(Bacon.once("lol"))) ,
      [1, "lol", 2, "lol"], unstable);
  });
  describe("should work with a source stream responding synchronously", function() {
    expectStreamEvents(
      () => fromArray([1, 2]).flatMap(value => Bacon.once(value)) ,
      [1, 2], semiunstable);
    expectStreamEvents(
      () => fromArray([1, 2]).flatMap((value: number) => fromArray([value, value*10])) ,
      [1, 10, 2, 20], semiunstable);
    expectStreamEvents(
      () => Bacon.once(1).flatMap(value => later(0, value)) ,
      [1], semiunstable);
  });
  describe("Works also when f returns a Property instead of an EventStream", () =>
    expectStreamEvents(
      () => series(1, [1,2]).flatMap(Bacon.constant),
      [1,2], semiunstable)
  );
  describe("Works also when f returns a constant value instead of an EventStream", () =>
    expectStreamEvents(
      () => series(1, [1,2]).flatMap(x => x),
      [1,2], semiunstable)
  );
  describe("Works also when f returns an Error instead of an EventStream", () =>
    expectStreamEvents(
      () => series(1, [1,2]).flatMap(x => new Bacon.Error(x)),
      [new Bacon.Error(1), new Bacon.Error(2)], semiunstable)
  );
  describe("Accepts a constant EventStream/Property as an alternative to a function", function() {
    expectStreamEvents(
      () => Bacon.once("asdf").flatMap(Bacon.constant("bacon")),
      ["bacon"]);
    expectStreamEvents(
      () => Bacon.once("asdf").flatMap(Bacon.once("bacon")),
      ["bacon"]);
  });
  it("toString", () => expect(Bacon.never().flatMap(function() {}).toString()).to.equal("Bacon.never().flatMap(function)"));
});


describe("Property.flatMap", function() {
  describe("should spawn new stream for all events including Init", () =>
    expectPropertyEvents(
      function() {
         const once = (x: number) => Bacon.once(x);
        return series(1, [1, 2]).toProperty(0).flatMap(once);
      },
      [0, 1, 2], semiunstable)
  );
  describe("Works also when f returns a Property instead of an EventStream", () =>
    expectPropertyEvents(
      () => series(1, [1,2]).toProperty().flatMap(Bacon.constant),
      [1,2], semiunstable)
  );
  describe("works for synchronous source", () =>
    expectPropertyEvents(
      function() {
        const once = (x: number) => Bacon.once(x);
        return fromArray([1, 2]).toProperty(0).flatMap(once);
      },
      [0, 1, 2], unstable)
  );
  it("toString", () => expect(Bacon.constant(1).flatMap(function() {}).toString()).to.equal("Bacon.constant(1).flatMap(function)"));
});
