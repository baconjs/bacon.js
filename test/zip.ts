import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, series, error, fromArray, semiunstable, repeatedly, add } from "./util/SpecHelper";

function pair<A, B>(x: A, y: B) { return [x, y] }

describe("EventStream.zip", function() {
  describe("pairwise combines values from two streams using given combinator function", () =>
    expectStreamEvents(
      () => series(1, [1, 2, 3]).zip(series(1, ['a', 'b', 'c']), (x,y) => x+y),
      ['1a', '2b', '3c'])
  );
  describe("zips as array if no combinator is given (legacy support)", () =>
    expectStreamEvents(
      () => (<any>series(1, [1, 2, 3])).zip(series(1, ['a', 'b', 'c'])),
      [[1, 'a'], [2, 'b'], [3, 'c']])
  );
  describe("works with synchronous sources", () =>
    expectStreamEvents(
      () => fromArray([1, 2, 3]).zip(fromArray(['a', 'b', 'c']), pair),
      [[1, 'a'], [2, 'b'], [3, 'c']])
  );
  describe("works with synchronous sources", () =>
    expectStreamEvents(
      () => fromArray([1, 2, 3]).zip(fromArray(['a', 'b', 'c']), pair),
      [[1, 'a'], [2, 'b'], [3, 'c']])
  );
  describe("passes through errors", () =>
    expectStreamEvents(
      () => series(2, [1, error(), 2]).zip(series(2, ['a', 'b']).delay(1), pair),
      [[1, 'a'], error(), [2, 'b']])
  );
  describe("completes as soon as possible", () =>
    expectStreamEvents(
      () => series(1, [1]).zip(series(1, ['a', 'b', 'c']), pair),
      [[1, 'a']])
  );
  describe("works with endless right stream", () =>
    expectStreamEvents(
      () => series(1, [1]).zip(repeatedly(1, [1]), add),
      [2])
  );
  describe("works with endless left stream", () =>
    expectStreamEvents(
      () => repeatedly(1, [1]).zip(series(1, [1]), add),
      [2])
  );
  describe("works with synchronous left and endless right stream", () =>
    expectStreamEvents(
      () => fromArray([1, 2]).zip(repeatedly(1, [1]), add),
      [2, 3])
  );
  describe("can zip an observable with itself", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, ['a', 'b', 'c']);
        return obs.zip(obs.skip(1), pair);
      },
      [['a', 'b'], ['b', 'c']])
  );
  it("toString", () => {
    expect(Bacon.never().zip(Bacon.never(), pair).toString()).to.equal("Bacon.never().zip(Bacon.never())")
  });
});

describe("Property.zip", () =>
  describe("pairwise combines values from two properties", () =>
    expectStreamEvents(
      () => series(1, [1, 2, 3]).toProperty().zip(series(1, ['a', 'b', 'c']).toProperty(), pair),
      [[1, 'a'], [2, 'b'], [3, 'c']], { semiunstable })
  )
);

describe("Bacon.zipAsArray", function() {
  describe("zips an array of streams into a stream of arrays", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2, 3, 4]);
        return Bacon.zipAsArray([obs, obs.skip(1), obs.skip(2)]);
      },
    [[1 , 2 , 3], [2 , 3 , 4]])
  );
  describe("supports n-ary syntax", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2, 3, 4]);
        return Bacon.zipAsArray(obs, obs.skip(1));
      },
    [[1 , 2], [2 , 3], [3, 4]])
  );
  describe("accepts Properties as well as EventStreams", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2, 3, 4]);
        return Bacon.zipAsArray(obs, obs.skip(1), Bacon.constant(5));
      },
    [[1 , 2, 5]])
  );
  describe("fires for Property events too (unlike Bacon.when)", () =>
    expectStreamEvents(
      function() {
        const stream = series(1, [1, 2, 3, 4]);
        const prop = series(1, [2, 3, 4, 5]).toProperty();
        return Bacon.zipAsArray(stream, prop);
      },
    [[1,2], [2,3], [3,4], [4,5]], { semiunstable })
  );
  describe("works with single stream", function() {
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2]);
        return Bacon.zipAsArray([obs]);
      },
    [[1], [2]]);
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2]);
        return Bacon.zipAsArray(obs);
      },
    [[1], [2]]);
  });
  describe("works with 0 streams (=Bacon.never())", function() {
    expectStreamEvents(
      () => Bacon.zipAsArray([]),
      []);
    expectStreamEvents(
      () => Bacon.zipAsArray(),
      []);
  });
  it("toString", () => expect(Bacon.zipAsArray(Bacon.never(), Bacon.never()).toString()).to.equal("Bacon.zipAsArray(Bacon.never(),Bacon.never())"));
});

describe("Bacon.zipWith", function() {
  const f = ((x: number,y: number,z: number) => x + y + z);
  describe("zips an array of streams with given function (legacy support)", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2, 3, 4]);
        return Bacon.zipWith(f, <any>[obs, obs.skip(1), obs.skip(2)]);
      },
      [1 + 2 + 3, 2 + 3 + 4]
    )
  )
  describe("accepts array of streams as first params too (legacy support)", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2, 3, 4]);
        return Bacon.zipWith(<any>[obs, obs.skip(1), obs.skip(2)], <any>f);
      },
      [1 + 2 + 3, 2 + 3 + 4]
    )
  );
  describe("supports n-ary syntax", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2, 3, 4]);
        return Bacon.zipWith(f, obs, obs.skip(1), obs.skip(2));
      },
    [1 + 2 + 3, 2 + 3 + 4])
  );
  describe("supports n-ary syntax, reverse", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1, 2, 3, 4]);
        return Bacon.zipWith(<any>obs, obs.skip(1), obs.skip(2), <any>f);
      },
    [1 + 2 + 3, 2 + 3 + 4])
  );
  describe("works with single stream", () =>
    expectStreamEvents(
      function() {
        const obs = series(1, [1,2]);
        return Bacon.zipWith(x => x * 2, obs);
      },
      [1 * 2, 2 * 2])
  );
  describe("works with 0 streams (=Bacon.never())", function() {
    expectStreamEvents(
      () => Bacon.zipWith(function() {}, <any>[]),
      []);
    expectStreamEvents(
      () => Bacon.zipWith(function() {}),
      []);
  });
  it("toString", () => expect(Bacon.zipWith((function() {}), Bacon.never()).toString()).to.equal("Bacon.zipWith(function,Bacon.never())"));
});
