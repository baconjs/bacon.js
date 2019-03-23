/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, error, series, semiunstable, t } from "./util/SpecHelper";

describe("EventStream.flatMapLatest", function() {
  describe("spawns new streams but collects values from the latest spawned stream only", () =>
    expectStreamEvents(
      () => series(3, [1, 2]).flatMapLatest(value => series(t(2), [value, error(), value])) ,
      [1, 2, error(), 2], semiunstable)
  );
  describe("Accepts a constant EventStream/Property as an alternative to a function", () =>
    expectStreamEvents(
      () => Bacon.once("asdf").flatMapLatest(Bacon.constant("bacon")),
      ["bacon"], semiunstable)
  );
  return it("toString", () => expect(Bacon.never().flatMapLatest(function() {}).toString()).to.equal("Bacon.never().flatMapLatest(function)"));
});

describe("Property.flatMapLatest", function() {
  describe("spawns new streams but collects values from the latest spawned stream only", () =>
    expectPropertyEvents(
      () => series(3, [1, 2]).toProperty(0).flatMapLatest(value => series(t(2), [value, value])) ,
      [0, 1, 2, 2], semiunstable)
  );
  describe("Accepts a constant EventStream/Property as an alternative to a function", () =>
    expectPropertyEvents(
      () => Bacon.constant("asdf").flatMapLatest(Bacon.constant("bacon")),
      ["bacon"], semiunstable)
  );
  it("Delivers initial value synchronously (fix #719)", function() {
      const flatMapLatestP = Bacon.never<number>()
        .toProperty(0)
        .flatMapLatest(x => Bacon.once(x));
      const result: number[] = [];
      flatMapLatestP.onValue(x => {result.push(x)});
      return expect(result).to.deep.equal([0]);
  });
  return it("toString", () => expect(Bacon.constant(1).flatMapLatest(function() {}).toString()).to.equal("Bacon.constant(1).flatMapLatest(function)"));
});
