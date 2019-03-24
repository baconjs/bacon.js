import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, series, semiunstable, add, repeatedly, repeat, once, expectError } from "./util/SpecHelper";

describe("Bacon.when", function() {
  describe("supports the new typed syntax", () =>
    expectStreamEvents(
      function() {
        const a = series(1, [1,2]);
        const b = series(6, [6,7]);
        const c = Bacon.constant("c");

        return Bacon.when(
          [a, c, (a,c) => c+a ],
          [b, (b => `${b}`)]);
      },
      ["c1", "c2", "6", "7"], semiunstable)
  );

  describe("synchronizes on join patterns", () =>
    expectStreamEvents(
      function() {
        const [a,b,_] = ['a','b','_'];
        const as = series(1, [a, _, a, a, _, a, _, _, a, a]).filter(x => x === a);
        const bs = series(1, [_, b, _, _, b, _, b, b, _, _]).filter(x => x === b);
        return Bacon.when(
          <any>[as, bs], <any>((a: number,b: number) => a + b),
          <any>[as],     <any>((a: number) => a)
        );
      },
      ['a', 'ab', 'a', 'ab', 'ab', 'ab'], semiunstable)
  );
  describe("consider the join patterns from top to bottom", () =>
    expectStreamEvents(
      function() {
        const [a,b,_] = ['a','b','_'];
        const as = series(1, [a, _, a, a, _, a, _, _, a, a]).filter(x => x === a);
        const bs = series(1, [_, b, _, _, b, _, b, b, _, _]).filter(x => x === b);
        return Bacon.when(
          [as, <any>((a: string) => a)],
          [as, bs, <any>((a: string,b: string) => a + b)]);
      },
      ['a', 'a', 'a', 'a', 'a', 'a'])
  );
  describe("handles any number of join patterns", () =>
    expectStreamEvents(
      function() {
        const [a,b,c,_] = ['a','b','c','_'];
        const as = series(1, [a, _, a, _, a, _, a, _, _, _, a, a]).filter(x => x === a);
        const bs = series(1, [_, b, _, _, _, b, _, b, _, b, _, _]).filter(x => x === b);
        const cs = series(1, [_, _, _, c, _, _, _, _, c, _, _, _]).filter(x => x === c);
        return Bacon.when(
          [[as, bs, cs], (a: string, b: string, c: string) => a + b + c],
          [[as, bs],     (a: string,b: string) => a + b],
          [[as],         a   => a]
        );
      },
      ['a', 'ab', 'a', 'abc', 'abc', 'ab'], semiunstable)
  );
  describe("doesn't synchronize on properties", function() {
    expectStreamEvents(
      function() {
        const p = repeat(1, ["p"]).take(100).toProperty();
        const s = series(3, ["1", "2", "3"]);
        return Bacon.when(
          [[p,s], (p: string, s: string) => p + s]);
      },
      ["p1", "p2", "p3"]);
    expectStreamEvents(
      function() {
        const p = series(3, ["p"]).toProperty();
        const s = series(1, ["1"]);
        return Bacon.when(
          [p,s, (p, s) => p + s]
        );
      },
      []);
    return expectStreamEvents(
      function() {
        const [a,b,c,_] = ['a','b','c','_'];
        const as = series(1, [a, _, a, _, a, _, a, _, _, _, a, _, a]).filter(x => x === a);
        const bs = series(1, [_, b, _, _, _, b, _, b, _, b, _, _, _]).filter(x => x === b);
        const cs = series(1, [_, _, _, c, _, _, _, _, c, _, _, c, _]).filter(x => x === c).map(1).scan(0, ((x,y) => x + y));
        return Bacon.when(
          [[as, bs, cs], (a: string,b: string,c: string) => a + b + c],
          [[as],         a   => a]);
      },
      ['a', 'ab0', 'a', 'ab1', 'ab2', 'ab3'], semiunstable);
  });
  it("Rejects patterns with Properties only", () => {
    expectError("At least one EventStream required", () => {
      Bacon.when([Bacon.constant(0), function() {}])
    })
  });
  describe("doesn't output before properties have values", () =>
    expectStreamEvents(
      function() {
        const p = series(2, ["p"]);
        const s = series(1, ["s"]);
        return Bacon.when(
          [s, p, (s, p) => s + p]
        );
      },
      ["sp"])
  );
  describe("returns Bacon.never() on the empty list of patterns", () =>
    expectStreamEvents(
      () => Bacon.when(),
      [])
  );
  describe("returns Bacon.never() when all patterns are zero-length", () =>
    expectStreamEvents(
      () => Bacon.when([[], function() {}]),
      [])
  );
  describe("works with empty patterns", () =>
    expectStreamEvents(
      () => Bacon.when(
           [[once(1)], x => x],
           [[], function() {}]) ,
      [1])
  );
  describe("works with empty patterns (2)", () =>
    expectStreamEvents(
      () => Bacon.when(
           [[], function() {}],
           [once(1), x => x]) ,
      [1])
  );
  describe("works with single stream", () =>
    expectStreamEvents(
      () => Bacon.when([once(1), x => x]),
      [1])
  );
  describe("works with multiples of streams", () =>
    expectStreamEvents(
      function() {
        const [h,o,c,_] = ['h','o','c','_'];
        const hs = series(1, [h, _, h, _, h, _, h, _, _, _, h, _, h]).filter(x => x === h);
        const os = series(1, [_, o, _, _, _, o, _, o, _, o, _, _, _]).filter(x => x === o);
        const cs = series(1, [_, _, _, c, _, _, _, _, c, _, _, c, _]).filter(x => x === c);
        return Bacon.when(
          [[hs, hs, os], (h1: string,h2: string,o: string) => [h1,h2,o]],
          [[cs, os],    (c: string,o: string) => [c,o]]);
      },
      [['h', 'h', 'o'], ['c', 'o'], ['h', 'h', 'o'], ['c', 'o']], semiunstable)
  );
  describe("works with multiples of properties", () =>
    expectStreamEvents(
      function() {
        const c = Bacon.constant("c");
        return Bacon.when(
          [c, c, once(1), (c1, c2, _) => c1 + c2]
        );
      },
      ["cc"])
  );
  describe("accepts constants instead of functions too", () =>
    expectStreamEvents(
      () => Bacon.when([once(1), 2], [once(2), 3]),
      [2, 3])
  );
  describe("works with synchronous sources", () =>
    expectStreamEvents(
      function() {
        const xs = once("x");
        const ys = once("y");
        return Bacon.when(
          [[xs, ys], add]
        );
      },
      ["xy"])
  );
  describe("works with endless sources", () =>
    expectStreamEvents(
      function() {
        const xs = repeatedly(1, ["x"]);
        const ys = once("y");
        return Bacon.when(
          [[xs, ys], add]
        );
      },
      ["xy"])
  );
  return it("toString", () => expect(Bacon.when([Bacon.never(), (function() {})]).toString()).to.equal("Bacon.when([Bacon.never(),function])"));
});
