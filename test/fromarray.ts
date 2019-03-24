import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, error, deferred, range } from "./util/SpecHelper";

describe("Bacon.fromArray", function() {
  describe("Turns an empty array into an EventStream", () =>
    expectStreamEvents(
      () => Bacon.fromArray([]),
      [])
  );
  describe("Turns a single-element array into an EventStream", () =>
    expectStreamEvents(
      () => Bacon.fromArray([1]),
      [1])
  );
  describe("Turns a longer array into an EventStream", () =>
    expectStreamEvents(
      () => Bacon.fromArray([1, 2, 3]),
      [1, 2, 3])
  );
  describe("Allows wrapped events, for instance, Bacon.Error", () =>
    expectStreamEvents(
      () => Bacon.fromArray([error(), 1]),
      [error(), 1])
  );
  it("doesn't use recursion", () => Bacon.fromArray(range(1, 50000, true)).onValue(function() {}));
  it("is asynchronous", function() {
    let counter = 0;
    Bacon.fromArray([1, 2]).onValue(() => {counter++});
    expect(counter).to.equal(0);
    deferred(() => expect(counter).to.equal(2));
  });
  it("toString", () => expect(Bacon.fromArray([1,2]).toString()).to.equal("Bacon.fromArray([1,2])"));
  it("doesn't mutate the given array, toString works after subscribe (bug fix)", function() {
    const array = [1,2];
    const s = Bacon.fromArray(array);
    s.onValue(function() {});
    deferred(function() {
      expect(s.toString()).to.equal("Bacon.fromArray([1,2])");
      expect(array).to.deep.equal([1,2]);
    });
  });
});