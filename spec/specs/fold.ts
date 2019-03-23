import { expectPropertyEvents, error, series, unstable, fromArray, add, range } from "./util/SpecHelper";

describe("EventStream.fold", function() {
  describe("folds stream into a single-valued Property, passes through errors", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).fold(0, add),
      [error(), 6])
  );
  describe("has reduce as synonym", () =>
    expectPropertyEvents(
      () => series(1, [1, 2, error(), 3]).fold(0, add),
      [error(), 6])
  );
  describe("works with synchronous source", () =>
    expectPropertyEvents(
      () => fromArray([1, 2, error(), 3]).fold(0, add),
      [error(), 6], unstable)
  );
  return describe.skip("works with really large chunks too, with { eager: true }", function() {
    const count = 50000;
    return expectPropertyEvents(
      () => series(1, range(1, count, true)).fold(0, ((x: number,y: number) => x+1)),
      [count]);
  });
});

describe("Property.fold", () =>
  describe("Folds Property into a single-valued one", () =>
    expectPropertyEvents(
      () => series(1, [2,3]).toProperty(1).fold(0, add),
      [6])
  )
);