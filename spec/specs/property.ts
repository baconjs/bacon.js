import * as Bacon from "../..";
import { expect } from "chai";
import { mockFunction } from "./util/Mock";

import { expectStreamEvents, expectPropertyEvents, error, fromArray, series, map, id, semiunstable, unstable, testSideEffects } from "./util/SpecHelper";

describe("Bacon.constant", function() {
  describe("creates a constant property", () =>
    expectPropertyEvents(
      () => Bacon.constant("lol"),
    ["lol"])
  );
  it("ignores unsubscribe", () => Bacon.constant("lol").onValue(() => {})());
  describe("provides same value to all listeners", function() {
    const c = Bacon.constant("lol");
    expectPropertyEvents((() => c), ["lol"]);
    it("check check", function() {
      const f = mockFunction();
      c.onValue(f);
      f.verify("lol");
    });
  });
  it("provides same value to all listeners, when mapped (bug fix)", function() {
    const c = map(Bacon.constant("lol"), id);
    const f = mockFunction();
    c.onValue(f);
    f.verify("lol");
    c.onValue(f);
    f.verify("lol");
  });
  it("toString", () => expect(Bacon.constant(1).toString()).to.equal("Bacon.constant(1)"));
});

describe("Property.toEventStream", function() {
  describe("creates a stream that starts with current property value", () =>
    expectStreamEvents(
      () => series(1, [1, 2]).toProperty(0).toEventStream(),
      [0, 1, 2], semiunstable)
  );
  describe("works with synchronous source", () =>
    expectStreamEvents(
      () => fromArray([1, 2]).toProperty(0).toEventStream(),
      [0, 1, 2], unstable)
  );
});

describe("Property.toProperty", function() {
  describe("returns the same Property", () =>
    expectPropertyEvents(
      () => Bacon.constant(1).toProperty(),
      [1])
  );
  it("rejects arguments", function() {
    expect(function() {
      (<any>(Bacon.constant(1))).toProperty(0);
    }).to.throw(Error, "no arguments supported")
  });
});

describe("Property.subscribe", () =>
  it("asserts that argument is function", function() {
    const f = () => Bacon.never().toProperty().subscribe(<any>"a string");
    expect(f).to.throw(Error);
  })
);

describe("Property.changes", function() {
  describe("sends property change events", () =>
    expectStreamEvents(
      function() {
        return series(1, ["b", error()]).toProperty("a").changes();
      },
      ["b", error()])
  );
  describe("works with synchronous source", () =>
    expectStreamEvents(
      () => fromArray([1, 2, 3]).toProperty(0).changes(),
      [1, 2, 3])
  );
});

describe("Observable.onValues", () =>
  it("splits value array to callback arguments", function() {
    const f = mockFunction();
    Bacon.constant([1,2,3]).onValues(f);
    f.verify(1,2,3);
  })
);

describe("Property.onValue", testSideEffects(Bacon.constant, "onValue"));
