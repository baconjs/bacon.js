import * as Bacon from "../..";
import { expect } from "chai";

import { expectPropertyEvents, unstable, error, fromArray, series, later } from "./util/SpecHelper";

describe("EventStream.toProperty", function() {
  describe("delivers current value and changes to subscribers", () =>
    expectPropertyEvents(
      () => later(1, "b").toProperty("a"),
      ["a", "b"])
  );
  describe("passes through also Errors", () =>
    expectPropertyEvents(
      () => series(1, [1, error(), 2]).toProperty(),
      [1, error(), 2])
  );

  describe("supports null as value", () =>
    expectPropertyEvents(
      () => series(1, [null, 1, null]).toProperty(null),
      [null, null, 1, null])
  );

  describe("does not get messed-up by a transient subscriber (bug fix)", () =>
    expectPropertyEvents(
      function() {
        const prop = series(1, [1,2,3]).toProperty(0);
        prop.subscribe(event => {
          return Bacon.noMore;
        });
        return prop;
      },
      [0, 1, 2, 3])
  );
  describe("works with synchronous source", function() {
    expectPropertyEvents(
      () => fromArray([1,2,3]).toProperty(),
      [1,2,3]);
    return expectPropertyEvents(
      () => fromArray([1,2,3]).toProperty(0),
      [0,1,2,3], unstable);
  });
  return it("toString", () => expect(Bacon.never().toProperty(0).toString()).to.equal("Bacon.never().toProperty(0)"));
});
