import * as Bacon from "../..";
import { expect } from "chai";

describe("EventStream.doEnd", function() {
  it("calls function before sending end to listeners", function() {
    const called: number[] = [];
    const bus = new Bacon.Bus<number>();
    const s = bus.doEnd(() => called.push(1));
    s.onEnd(() => { called.push(2); return undefined });
    bus.end();
    expect(called).to.deep.equal([1, 2]);
  });
  it("toString", () => expect(Bacon.never().doEnd((function() {})).toString()).to.equal("Bacon.never().doEnd(function)"));
});
