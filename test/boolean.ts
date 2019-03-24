import { expectPropertyEvents } from "./util/SpecHelper";
import * as Bacon from "..";
import { expect } from "chai";

describe("Boolean logic", function() {
  describe("combines Properties with and()", () =>
    expectPropertyEvents(
      () => Bacon.constant(true).and(Bacon.constant(false)),
      [false])
  );
  describe("combines Properties with or()", () =>
    expectPropertyEvents(
      () => Bacon.constant(true).or(Bacon.constant(false)),
      [true])
  );
  describe("inverts property with not()", () =>
    expectPropertyEvents(
      () => Bacon.constant(true).not(),
      [false])
  );
  describe("accepts constants instead of properties", function() {
    describe("true and false", () =>
      expectPropertyEvents(
        () => Bacon.constant(true).and(Bacon.constant(false)),
        [false])
    );
    describe("true and true", () =>
      expectPropertyEvents(
        () => Bacon.constant(true).and(Bacon.constant(true)),
        [true])
    );
    describe("true or false", () =>
      expectPropertyEvents(
        () => Bacon.constant(true).or(Bacon.constant(false)),
        [true])
    );
  });
  it("toString", () => expect(Bacon.constant(1).and(Bacon.constant(2).not()).or(Bacon.constant(3)).toString()).to.equal("Bacon.constant(1).and(Bacon.constant(2).not()).or(Bacon.constant(3))"));
});
