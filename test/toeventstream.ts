import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, fromArray, series, semiunstable, unstable, deferred } from "./util/SpecHelper";

describe("Property.toEventStream", function() {
  describe("creates a stream that starts with current property value", () =>
    expectStreamEvents(
      () => series(1, [1, 2]).toProperty(0).toEventStream(),
      [0, 1, 2], semiunstable)
  );
  describe("works with synchronous source", () =>
    expectStreamEvents(
      () => fromArray([1, 2]).toProperty(0).toEventStream(),
      [0, 1, 2], unstable)
  );
  it("responds asynchronously", function() {
    let sync = false;
    const vals = Bacon.interval<number>(150, 0)
      .scan(0, x => x + 1)
      .toEventStream();
    vals.take(1).onValue(() => { sync = true; return Bacon.more });
    expect(sync).to.equal(false);
    deferred(() => expect(sync).to.equal(true));
  });
});
