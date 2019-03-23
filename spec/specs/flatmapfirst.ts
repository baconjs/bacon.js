import * as Bacon from "../..";
import { expect } from "chai";
import { expectStreamEvents, expectPropertyEvents, series, semiunstable } from "./util/SpecHelper";

describe("EventStream.flatMapFirst", function() {
  describe("spawns new streams and ignores source events until current spawned stream has ended", () =>
    expectStreamEvents(
      () => series(2, [2, 4, 6, 8]).flatMapFirst(value => series(1, [`a${value}`, `b${value}`, `c${value}`])) ,
      ["a2", "b2", "c2", "a6", "b6", "c6"], semiunstable)
  );
  return it("toString", () => expect(Bacon.never().flatMapFirst(function() {}).toString()).to.equal("Bacon.never().flatMapFirst(function)"));
});

describe("Property.flatMapFirst", function() {
  describe("spawns new streams and ignores source events until current spawned stream has ended", () =>
    expectPropertyEvents(
      () => series(2, [2, 4, 6, 8]).toProperty().flatMapFirst(value => series(1, [`a${value}`, `b${value}`, `c${value}`])) ,
      ["a2", "b2", "c2", "a6", "b6", "c6"], semiunstable)
  );
  return it("toString", () => expect(Bacon.constant("").flatMapFirst(function() {}).toString()).to.equal("Bacon.constant().flatMapFirst(function)"));
});