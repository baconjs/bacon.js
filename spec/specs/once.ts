import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, error, deferred } from "./util/SpecHelper";

describe("Bacon.once", function() {
  describe("should send single event and end", () =>
    expectStreamEvents(
      () => Bacon.once("pow"),
      ["pow"])
  );
  describe("accepts an Error event as parameter", () =>
    expectStreamEvents(
      () => Bacon.once(new Bacon.Error("oop")),
      [error()])
  );
  describe("Allows wrapped events, for instance, Bacon.Error", () =>
    expectStreamEvents(
      () => Bacon.once(error()),
      [error()])
  );
  return it("Responds asynchronously", function() {
    const values: number[] = [];
    const s = Bacon.once(1);
    s.onValue(value => { values.push(value)});
    s.onValue(value => { values.push(value)});
    expect(values).to.deep.equal([]);
    return deferred(() => expect(values).to.deep.equal([1, 1]));
  });
});
