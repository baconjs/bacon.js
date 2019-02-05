import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, series } from "./util/SpecHelper";

describe("EventStream.doAction", function() {
  it("calls function before sending value to listeners", function() {
    const called: number[] = [];
    const bus = new Bacon.Bus<number>();
    const s = bus.doAction(x => called.push(x));
    s.onValue(() => Bacon.more);
    s.onValue(() => Bacon.more);
    bus.push(1);
    expect(called).to.deep.equal([1]);
  });
  describe("does not alter the stream", () =>
    expectStreamEvents(
      () => series(1, [1, 2]).doAction(() => {}),
      [1, 2])
  );
  it("toString", () => expect(Bacon.never().doAction((function() {})).toString()).to.equal("Bacon.never().doAction(function)"));
});
