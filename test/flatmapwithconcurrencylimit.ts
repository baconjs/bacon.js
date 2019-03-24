import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, error, series, semiunstable, t, expectPropertyEvents } from "./util/SpecHelper";

describe("EventStream.flatMapWithConcurrencyLimit", function() {
  describe("limits the number of concurrently active spawned streams by queuing", () =>
    expectStreamEvents(
      () => series(1, [1, 2]).flatMapWithConcurrencyLimit(1, value => series(t(2), [value, error(), value])) ,
      [1, error(), 1, 2, error(), 2], semiunstable)
  );
  describe("works with n=2", () =>
    expectStreamEvents(
      () => series(1, [1,2,3]).flatMapWithConcurrencyLimit(2, value => series(t(2), [value, value])) ,
      [1, 2, 1, 2, 3, 3], semiunstable)
  );
  return it("toString", () =>
    expect(Bacon.once(1).flatMapWithConcurrencyLimit(2, function() {}).toString())
      .to.equal("Bacon.once(1).flatMapWithConcurrencyLimit(2,function)")
  );
});

describe("Property.flatMapWithConcurrencyLimit", function() {
  describe("limits the number of concurrently active spawned streams by queuing", () =>
    expectPropertyEvents(
      () => series(1, [1, 2]).toProperty().flatMapWithConcurrencyLimit(1, value => series(t(2), [value, error(), value])) ,
      [1, error(), 1, 2, error(), 2], semiunstable)
  );
  return it("toString", () =>
    expect(Bacon.constant(1).flatMapWithConcurrencyLimit(2, function() {}).toString())
      .to.equal("Bacon.constant(1).flatMapWithConcurrencyLimit(2,function)")
  );
});