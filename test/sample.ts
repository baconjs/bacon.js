import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, error, fromArray, series, repeat, semiunstable, t, later, add } from "./util/SpecHelper";

describe("Property.sampledBy(stream)", function() {
  describe("samples property at events, resulting to EventStream", () =>
    expectStreamEvents(
      function() {
        const prop = series(2, [1, 2]).toProperty();
        const stream = repeat(3, ["troll"]).take(4);
        return prop.sampledBy(stream);
      },
      [1, 2, 2, 2])
  );
  describe("includes errors from both Property and EventStream", () =>
    expectStreamEvents(
      function() {
        const prop = series(2, [error(), 2]).toProperty();
        const stream = series(3, [error(), "troll"]);
        return prop.sampledBy(stream);
      },
      [error(), error(), 2])
  );
  describe("ends when sampling stream ends", () =>
    expectStreamEvents(
      function() {
        const prop = repeat(2, [1, 2]).toProperty();
        const stream = repeat(2, [""]).delay(t(1)).take(4);
        return prop.sampledBy(stream);
      },
      [1, 2, 1, 2])
  );
  describe("accepts optional combinator function f(Vp, Vs)", () =>
    expectStreamEvents(
      function() {
        const prop = series(2, ["a", "b"]).toProperty();
        const stream = series(2, ["1", "2", "1", "2"]).delay(t(1));
        return (<any>prop).sampledBy(stream, add);
      },
      ["a1", "b2", "b1", "b2"])
  );
  describe("allows method name instead of function too", () =>
    expectStreamEvents(
      () => (<any>Bacon.constant([1])).sampledBy(Bacon.once([2]), (a: number[], b: number[]) => a.concat(b)),
      [[1, 2]])
  );
  describe("works with same origin", function() {
    expectStreamEvents(
      function() {
        const src = series(2, [1, 2]);
        return src.toProperty().sampledBy(src);
      },
      [1, 2]);
    return expectStreamEvents(
      function() {
        const src = series(2, [1, 2]);
        return src.toProperty().sampledBy(src.map(x => x * 2));
      },
      [1, 2]);
  });
  describe("skips samplings that occur before the property gets its first value", function() {
    expectStreamEvents(
      function() {
        const p = series(5, [1]).toProperty();
        return p.sampledBy(series(3, [0]));
      },
      []);
    expectStreamEvents(
      function() {
        const p = series(5, [1, 2]).toProperty();
        return p.sampledBy(series(3, [0, 0, 0, 0]));
      },
      [1, 1, 2], semiunstable);
    return expectPropertyEvents(
      function() {
        const p = series(5, [1, 2]).toProperty();
        return p.sampledBy(series(3, [0, 0, 0, 0]).toProperty());
      },
      [1, 1, 2], semiunstable);
  });
  describe("works with stream of functions", function() {
    const f = function() {};
    return expectStreamEvents(
      function() {
        const p = series(1, [f]).toProperty();
        return p.sampledBy(series(1, [1, 2, 3]));
      },
      [f, f, f]);
  });
  describe("works with synchronous sampler stream", function() {
    expectStreamEvents(
      () => Bacon.constant(1).sampledBy(fromArray([1,2,3])),
      [1,1,1], semiunstable);
    return expectStreamEvents(
      () => later(1, 1).toProperty().sampledBy(fromArray([1,2,3])),
      []);
  });
  return it("toString", () => expect(Bacon.constant(0).sampledBy(Bacon.never()).toString()).to.equal("Bacon.constant(0).sampledBy(Bacon.never())"));
});

describe("Property.sampledBy(property)", function() {
  describe("samples property at events, resulting to a Property", () =>
    expectPropertyEvents(
      function() {
        const prop = series(2, [1, 2]).toProperty();
        const sampler = repeat(3, ["troll"]).take(4).toProperty();
        return prop.sampledBy(sampler);
      },
      [1, 2, 2, 2])
  );
  describe("works on an event stream by automatically converting to property", () =>
    expectPropertyEvents(
      function() {
        const stream = series(2, [1, 2]);
        const sampler = repeat(3, ["troll"]).take(4).toProperty();
        return stream.sampledBy(sampler);
      },
      [1, 2, 2, 2])
  );
  return describe("accepts optional combinator function f(Vp, Vs)", () =>
    expectPropertyEvents(
      function() {
        const prop = series(2, ["a", "b"]).toProperty();
        const sampler = series(2, ["1", "2", "1", "2"]).delay(t(1)).toProperty();
        return (<any>prop).sampledBy(sampler, add);
      },
      ["a1", "b2", "b1", "b2"])
  );
});

describe("Property.sample", function() {
  describe("samples property by given interval", () =>
    expectStreamEvents(
      function() {
        const prop = series(2, [1, 2]).toProperty();
        return prop.sample(t(3)).take(4);
      },
      [1, 2, 2, 2])
  );
  describe("includes all errors", () =>
    expectStreamEvents(
      function() {
        const prop = series(2, [1, error(), 2]).toProperty();
        return prop.sample(t(5)).take(2);
      },
      [error(), 1, 2], semiunstable)
  );
  describe("works with synchronous source", () =>
    expectStreamEvents(
      function() {
        const prop = Bacon.constant(1);
        return prop.sample(t(3)).take(4);
      },
      [1, 1, 1, 1])
  );
  return it("toString", () => expect(Bacon.constant(0).sample(1).toString()).to.equal("Bacon.constant(0).sample(1)"));
});
