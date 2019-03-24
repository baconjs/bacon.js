import * as  Bacon from "..";

import { expectPropertyEvents, unstable, semiunstable, later, series } from "./util/SpecHelper";
import { expect } from "chai";

describe("EventStream.awaiting(other)", () => {
  describe("indicates whether s1 has produced output after s2 (or only the former has output so far)", () =>
    expectPropertyEvents(
      () => series(2, [1, 1]).awaiting(series(3, [2])),
      [false, true, false, true], semiunstable)
  );
  describe("supports awaiting Properties", () =>
    expectPropertyEvents(
      () => series(2, [1, 1]).awaiting(series(3, [2]).toProperty()),
      [false, true, false, true], semiunstable)
  );
  describe("supports simultaneouts events", () => {
    expectPropertyEvents(
      () => {
        const src = later(1, 1);
        return src.awaiting(src.map(() => {}));
      },
      [false]);
    return expectPropertyEvents(
      () => {
        const src = later(1, 1);
        return src.map(() => {}).awaiting(src);
      },
      [false]);
  });
  it("toString", () => expect(Bacon.never().awaiting(Bacon.never()).toString()).to.equal("Bacon.never().awaiting(Bacon.never())"));
});

describe("Property.awaiting(eventstream)", () =>
  describe("indicates whether p1 has produced output after p2 (or only the former has output so far)", () =>
    expectPropertyEvents(
      () => series(2, [1, 1]).toProperty().awaiting(series(3, [2])),
      [false, true, false, true], semiunstable)
  )
);

describe("Property.awaiting(property)", () => {
  describe("works for awaiting self", () =>
    expectPropertyEvents(
      () => {
        const p = Bacon.constant(1);
        return p.awaiting(p);
      },
      [false])
  );
  describe("indicates whether p1 has produced output after p2 (or only the former has output so far)", () =>
    expectPropertyEvents(
      () => series(2, [1, 1]).toProperty().awaiting(series(3, [2]).toProperty()),
      [false, true, false, true], semiunstable)
  );
  describe("works for awaiting slf.map", () => {
    expectPropertyEvents(
      () => {
        const p = Bacon.constant(1);
        return p.awaiting(p.map(() => {}));
      },
      [false]);
    expectPropertyEvents(
      () => {
        const p = Bacon.constant(1);
        return p.map(x => x).awaiting(p.map(() => {}));
      },
      [false]);
    expectPropertyEvents(
      () => {
        const p = Bacon.constant(1);
        return p.map(() => {}).awaiting(p);
      },
      [false]);
  });  
  describe("works for awaiting self.flatMap", () =>
    expectPropertyEvents(
      () => {
        const p = Bacon.constant(1);
        return p.awaiting(p.flatMap(x => Bacon.once(x)));
      },
      [true, false], unstable)
  );
});

describe("EventStream.awaiting(property)", () => {
  describe("works correctly when EventStream emits first", () =>
    expectPropertyEvents(
      () => series(2, [1, 1]).awaiting(series(3, [2])),
      [false, true, false, true], semiunstable)
  );
  describe("works correctly when Property emits first", () =>
    expectPropertyEvents(
      () => series(3, [1]).awaiting(series(2, [2, 2])),
      [false, true, false], semiunstable)
  );
});
