import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, series } from "./util/SpecHelper";

describe("EventStream.doError", function() {
  it("calls function before sending error to listeners", function() {
    const called: number[] = [];
    const bus = new Bacon.Bus<number>();
    const s = bus.doError(x => called.push(x));
    s.onValue(() => undefined);
    s.onError(x => { called.push(x+1); return undefined });
    bus.error(1);
    bus.push(99);
    expect(called).to.deep.equal([1, 2]);
  });
  describe("does not alter the stream", () =>
    expectStreamEvents(
      () => series(1, [1, 2]).doError(function() {}),
      [1, 2])
  );
  it("toString", () => expect(Bacon.never().doError((function() {})).toString()).to.equal("Bacon.never().doError(function)"));
});
