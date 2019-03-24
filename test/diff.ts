import * as Bacon from "..";
import { expect } from "chai";

import { expectPropertyEvents, series, add, error } from "./util/SpecHelper";

describe("EventStream.diff", function() {
  describe("apply diff function to previous and current values, passing through errors", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).diff(0, add),
      [1, 3, error(), 5])
  );
  it("does not yields the start value immediately", function() {
    const outputs: number[] = [];
    const bus = new Bacon.Bus();
    bus.diff(0, () => 1).onValue(value => {
      outputs.push(value)
      return Bacon.more
    });
    expect(outputs).to.deep.equal([]);
  });
  it("toString", () => expect(Bacon.never().diff(0, (function() {})).toString()).to.equal("Bacon.never().diff(0,function)"));
});

describe("Property.diff", function() {
  describe("with Init value, starts with f(start, init)", () =>
    expectPropertyEvents(
      () => series(1, [2,3]).toProperty(1).diff(0, add),
      [1, 3, 5])
  );
  describe("without Init value, waits for the first value", () =>
    expectPropertyEvents(
      () => series(1, [2,3]).toProperty().diff(0, add),
      [2, 5])
  );
  describe("treats null start value like any other value", function() {
    expectPropertyEvents(
      () => series(1, [1]).toProperty().diff(<any>null, add),
      [1]);
    expectPropertyEvents(
      () => series(1, [2]).toProperty(1).diff(<any>null, add),
      [1, 3]);
  });
});
