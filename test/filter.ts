import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, error, once, fromArray, series, lessThan, map, deferred, t } from "./util/SpecHelper";

describe("EventStream.filter", function() {
  describe("should filter values", () =>
    expectStreamEvents(
      () => series(1, [1, 2, error(), 3]).filter(lessThan(3)),
      [1, 2, error()])
  );

  describe("can filter by Property value", () =>
    expectStreamEvents(
      function() {
        const src = series(1, [1,1,2,3,4,4,8,7]);
        const odd = map(src, (x: number) => x % 2).toProperty();
        return src.filter(odd);
      },
      [1,1,3,7])
  );
  it("toString", () => expect(Bacon.never().filter(() => false).toString()).to.equal("Bacon.never().filter(function)"));
});

describe("Property.filter", function() {
  describe("should filter values", () =>
    expectPropertyEvents(
      () => series(1, [1, error(), 2, 3]).toProperty().filter(lessThan(3)),
      [1, error(), 2])
  );
  it("preserves old current value if the updated value is non-matching", function() {
    const p = fromArray([1,2]).toProperty().filter(lessThan(2));
    p.onValue(() => undefined); // to ensure that property is actualy updated
    const values: number[] = [];
    p.onValue((v: number) => { values.push(v); return undefined });
    deferred(() => expect(values).to.deep.equal([1]));
  });
  describe("can filter by Property value", () =>
    expectPropertyEvents(
      function() {
        const src = series(2, [1, 2, 3, 4]).delay(t(1)).toProperty();
        const ok = series(2, [false, true, true, false]).toProperty();
        return src.filter(ok);
      },
      [2, 3])
  );
});

describe("Observable.filter(EventStream)", () =>
  it("should throw an error", () =>
    expect(
      () => once(true).filter(<any>once(true))).to.throw(Error)
  )
);
