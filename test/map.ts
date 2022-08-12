import * as Bacon from "..";
import { assert, expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, series, error, whenDeepStrictEqual } from "./util/SpecHelper";
import {Observable} from "..";

// needs to run by the shell as
// TS_NODE_COMPILER_OPTIONS='{"noImplicitAny":false}' mocha -r ts-node/register ./test/map.ts

const times2 = (x: number) => x * 2;

describe("Property.map", () =>
  describe("maps property values", () =>
    expectPropertyEvents(
      () => series(1, [2, error()]).toProperty(1).map(times2),
      [2, 4, error()])
  )
);

describe("EventStream.map", function() {
  describe("should map with given function", () =>
    expectStreamEvents(
      () => series(1, [1, 2, 3]).map(times2),
      [2, 4, 6])
  );
  describe("also accepts a constant value", () =>
    expectStreamEvents(
      () => series(1, [1, 2, 3,]).map("lol"),
      ["lol", "lol", "lol"])
  );
  describe("can map to a Property value", () =>
    expectStreamEvents(
      () => series(1, [1,2,3]).map(Bacon.constant(2)),
      [2,2,2])
  );
  describe("type inference", () => {
    it("case 1", () => {
      const bus = new Bacon.Bus<number>()
      const obs = Bacon.once(29).map(x => x + 1);
      bus.plug(obs)
    })
    it("case 2", () => {
      const bus = new Bacon.Bus<number>()
      bus.plug(Bacon.once(29).map(x => x + 1))
    })
  })
  it("toString", () => expect(Bacon.never().map(true).toString()).to.equal("Bacon.never().map(true)"));

  describe("Fantasy-Land functor", () => {
    const
      map = (fn: any) => (m: Observable<any>) => m['fantasy-land/map'](fn),
      identity = _ => _,
      o = f => g => x => f(g(x));

    it("obeys the identity law", () => {
      const foo = Bacon.once("foo");
      return whenDeepStrictEqual(map(identity)(foo), foo);
    });

    it("obeys composition law", function () {
      const
        foo = Bacon.once("foo"),
        f = s => `${s}-f`, g = s => `${s}-g`, gz = () => undefined, gn = () => [],
        // F.map(x => f(g(x)), mx) ≡ F.map(f, F.map(g, mx))
        assertCompositionLaw = (m, f, g, desc = "") =>
          whenDeepStrictEqual(
            map(o(f)(g))(m),
            o(map(f))(map(g))(m),
            desc
          );

      return Promise.all([
        assertCompositionLaw(foo, f, g),
        assertCompositionLaw(foo, g, f),
        assertCompositionLaw(foo, f, gz),
        assertCompositionLaw(foo, f, gn)
      ]);
    });
  });
});
