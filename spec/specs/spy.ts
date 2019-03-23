import * as Bacon from "../..";
import { expect } from "chai";
import { once } from "./util/SpecHelper";

describe("Bacon.spy", function() {
  const testSpy = function(expectedCount: number, f: () => Bacon.Observable<any>) {
    let calls = 0;
    const spy = function(obs: Bacon.Observable<any>) {
      obs.toString();
      return calls++;
    };
    Bacon.spy(spy);
    f();
    expect(calls).to.equal(expectedCount);
  };
  describe("calls spy function for all created Observables", function() {
    it("EventStream", () => testSpy(1, () => once(1)));
    it("Property", () => testSpy(1, () => Bacon.constant(1)));
    it("map", () => testSpy(2, () => once(1).map(function() {})));
    it("combineTemplate (also called for the intermediate combineAsArray property)", () => testSpy(4, () => Bacon.combineTemplate([once(1), Bacon.constant(2)])));
  });
});
