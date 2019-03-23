/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as Bacon from "../..";

import { expect } from "chai";

import { expectPropertyEvents, expectStreamEvents, series, error, once, add, t, deferred } from "./util/SpecHelper";
import { mockFunction } from "./util/Mock";

describe("Property.combine", function() {
  describe("combines latest values of two properties, with given combinator function, passing through errors", () =>
    expectPropertyEvents(
      function() {
        const left = series(2, [1, error(), 2, 3]).toProperty();
        const right = series(2, [4, error(), 5, 6]).delay(t(1)).toProperty();
        return left.combine(right, add);
      },
      [5, error(), error(), 6, 7, 8, 9])
  );

  describe("combines with null values", () =>
    expectPropertyEvents(
      function() {
        const left = series(1, [null]).toProperty();
        const right = series(1, [null]).toProperty();
        return left.combine(right, (l, r)=> [l, r]);
      },
      [[null, null]])
  );

  it("unsubscribes when initial value callback returns Bacon.noMore", function() {
    let calls = 0;
    const bus = new Bacon.Bus<string[]>();
    const other = Bacon.constant(["rolfcopter"]);
    bus.toProperty(["lollerskates"]).combine(other, (a, b) => a.concat(b)).subscribe(function(e) {
      if (!e.isInitial) {
        calls += 1;
      }
      return Bacon.noMore;
    });

    bus.push(["fail whale"]);
    return expect(calls).to.equal(0);
  });
  describe("does not duplicate same error from two streams", () =>
    expectPropertyEvents(
      function() {
        const src = series(1, ["same", error()]);
        return Bacon.combineAsArray(src, src);
      },
      [["same", "same"], error()])
  );

  it("toString", () => expect(Bacon.constant(1).combine(Bacon.constant(2), (function() {})).toString()).to.equal("Bacon.constant(1).combine(Bacon.constant(2),function)"));
  return describe("with random methods on Array.prototype", () =>
    it("doesn't throw exceptions", function() {
      try {
        (<any>Array.prototype).foo = "bar";
        const events : string[][] = [];
        once("a").combine(once("b"), (a,b) => [a,b]).onValue(v => { events.push(v); return Bacon.more });
        deferred(function() { 
          expect(events).to.deep.equal([["a", "b"]]);
          delete (<any>Array.prototype).foo;
        })
      } catch (error1) {}
    })
  );
});

describe("EventStream.combine", () =>
  describe("converts stream to Property, then combines", () =>
    expectPropertyEvents(
      function() {
        const left = series(2, [1, error(), 2, 3]);
        const right = series(2, [4, error(), 5, 6]).delay(t(1)).toProperty();
        return left.combine(right, add);
      },
      [5, error(), error(), 6, 7, 8, 9])
  )
);

describe("Bacon.combineAsArray", function() {
  describe("initial value", function() {
    let event : Bacon.Event<number[]> | null = null;
    before(function() {
      const prop = Bacon.constant(1);
      return Bacon.combineAsArray(prop).subscribe(function(x) {
        if (x.hasValue) { event = x; }
        return Bacon.more
      });
    });
    return it("is output as Initial event", () => expect(event && event.isInitial).to.equal(true));
  });
  describe("combines properties and latest values of streams, into a Property having arrays as values", () =>
    expectPropertyEvents(
      function() {
        const stream = series(1, ["a", "b"]);
        return Bacon.combineAsArray([Bacon.constant(1), Bacon.constant(2), stream]);
      },
      [[1, 2, "a"], [1, 2, "b"]])
  );
  describe("Works with streams provided as a list of arguments as well as with a single array arg", () =>
    expectPropertyEvents(
      function() {
        const stream = series(1, ["a", "b"]);
        return Bacon.combineAsArray(Bacon.constant(1), Bacon.constant(2), stream);
      },
      [[1, 2, "a"], [1, 2, "b"]])
  );
  describe("works with single property", () =>
    expectPropertyEvents(
      () => Bacon.combineAsArray([Bacon.constant(1)]),
      [[1]])
  );
  describe("works with single stream", () =>
    expectPropertyEvents(
      () => Bacon.combineAsArray([once(1)]),
      [[1]])
  );
  describe("works with arrays as values, with first array being empty (bug fix)", () =>
    expectPropertyEvents(
      () => Bacon.combineAsArray([Bacon.constant([]), Bacon.constant([1])]),
    ([[[], [1]]]))
  );
  describe("works with arrays as values, with first array being non-empty (bug fix)", () =>
    expectPropertyEvents(
      () => Bacon.combineAsArray([Bacon.constant([1]), Bacon.constant([2])]),
    ([[[1], [2]]]))
  );
  describe("works with empty array", () =>
    expectPropertyEvents(
      () => Bacon.combineAsArray([]),
      [[]])
  );
  describe("works with empty args list", () =>
    expectPropertyEvents(
      () => Bacon.combineAsArray(),
      [[]])
  );
  describe("accepts constant values instead of Observables (legacy support)", () =>
    expectPropertyEvents(
      () => Bacon.combineAsArray(Bacon.constant(1), <any>2, <any>3),
    [[1,2,3]])
  );
  describe("works with synchronous sources and flatMap (#407)", () =>
    expectStreamEvents(
      (() => once(123).flatMap(() => Bacon.combineAsArray(once(1), once(2), <any>3))),
    [[1,2,3]])
  );
  return it("toString", () => expect(Bacon.combineAsArray(Bacon.never()).toString()).to.equal("Bacon.combineAsArray(Bacon.never())"));
});

describe("Bacon.combineWith", function() {
  describe("combines n properties, streams and constants (legacy support) using an n-ary function", () =>
    expectPropertyEvents(
      function() {
        const stream = series(1, [1, 2]);
        const f = (x: number, y: number, z: number) => x + y + z;
        return Bacon.combineWith(f, stream, Bacon.constant(10), <any>100);
      },
      [111, 112])
  );
  describe("works with single input", () =>
    expectPropertyEvents(
      function() {
        const stream = series(1, [1, 2]);
        const f = (x : number) => x * 2;
        return Bacon.combineWith(f, stream);
      },
      [2, 4])
  );
  describe("works with 0 inputs (results to a constant)", () =>
    expectPropertyEvents(
      () => Bacon.combineWith(() => 1),
      [1])
  );
  describe("works with streams provided as an array as first arg (legacy support)", () =>
    expectPropertyEvents(
      function() {
        const f = Math.max;
        return Bacon.combineWith(f, <any>[Bacon.constant(0), Bacon.constant(1)]);
      },
      [1]
    )
  );
  describe("works with streams provided as an array as second arg (legacy support)", () =>
    expectPropertyEvents(
      function() {
        const f = Math.max;
        return Bacon.combineWith(<any>[Bacon.constant(0), Bacon.constant(1)], <any>f);
      },
      [1]
    )
  );
  describe("works with streams provided as arguments and function as last argument (legacy support)", () =>
    expectPropertyEvents(
      function() {
        const f = Math.max;
        return Bacon.combineWith(<any>Bacon.constant(0), <any>Bacon.constant(1), <any>f);
      },
      [1]
    )
  );
  describe("works with empty array", () =>
    expectPropertyEvents(
      () => Bacon.combineWith((() => 1), <any>[]),
      [1]
    )
  );
  return it("toString", () => expect(Bacon.combineWith((function() {}), Bacon.never()).toString()).to.equal("Bacon.combineWith(function,Bacon.never())"));
});

describe("Bacon.onValues", () =>
  it("is a shorthand for combineAsArray.onValues", function() {
    const f = mockFunction();
    Bacon.onValues(1, 2, 3, f);
    return f.verify(1,2,3);
  })
);
