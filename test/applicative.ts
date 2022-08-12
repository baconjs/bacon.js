import * as Bacon from "..";
import { assert } from "chai";
import {whenDeepStrictEqual} from "./util/SpecHelper";

describe("EventStream Fantasy-Land ap", function() {
  const
    ap = mfn => m => m['fantasy-land/ap'](mfn),
    identity = _ => _,
    o = b2c => a2b => a => b2c(a2b(a)),
    assertCompositionLaw = (ma, mb2c, ma2b, desc= "") =>
      whenDeepStrictEqual(
        ma.ap(ma2b.ap(mb2c.map(o))).fold([], (acc, next) => [...acc, next]),
        ma.ap(ma2b).ap(mb2c).fold([], (acc, next) => [...acc, next]),
        desc
      );

  it("applies the wrapped function(s) to the wrapped value(s)", () => {
    return ap(Bacon.once(s => `${s}-bar`))(Bacon.fromArray(["foo", "baz"]))
    .fold([], (acc, next) => [...acc, next])
    .toPromise()
    .then(xs => { assert.deepStrictEqual(xs, ["foo-bar", "baz-bar"]); });
  });

  it("obeys the interchange law for single value streams", () => {
    return whenDeepStrictEqual(
      Bacon.once("foo").ap(Bacon.once(s => `${s}-bar`)),
      Bacon.once(s => `${s}-bar`).ap(Bacon.once(f => f("foo")))
    );
  });

  it("obeys composition law for single value streams", () => {
    const
      foo = Bacon.once("foo"),
      f = Bacon.once(s => `${s}-f`), g = Bacon.once(s => `${s}-g`), gz = Bacon.once(() => undefined),
      gn = Bacon.fromArray([s => `${s}-f`, s => `${s}-g`]);

    return Promise.all([
      assertCompositionLaw(foo, f, g),
      assertCompositionLaw(foo, g, f),
      assertCompositionLaw(foo, f, gz),
      assertCompositionLaw(foo, f, gn)
    ]);
  });

});
