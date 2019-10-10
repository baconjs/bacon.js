import * as Bacon from "..";

import { expectStreamEvents, unstable, error, soon, once, toValues, later, verifyCleanup, t, deferred } from "./util/SpecHelper";
import { expect } from "chai";

describe("Bacon.Bus", function() {
  it("merges plugged-in streams", function() {
    const bus = new Bacon.Bus<string>();
    const values: string[] = [];
    const dispose = bus.onValue(value => {
      values.push(value)
      return Bacon.more
    });
    const push = new Bacon.Bus<string>();
    bus.plug(push);
    push.push("lol");
    expect(values).to.deep.equal(["lol"]);
    dispose();
    verifyCleanup();
  });
  describe("works with looped streams", function() {
    expectStreamEvents(
      function() {
        const bus = new Bacon.Bus<string>();
        bus.plug(later(t(2), "lol"));
        const filter = (value: string) => "lol" === value;
        bus.plug(bus.filter(filter).map(() => "wut"));
        later(t(4)).onValue(() => bus.end());
        return bus;
      },
      ["lol", "wut"], unstable);
    it("dispose works with looped streams", function() {
      const bus = new Bacon.Bus<string>();
      bus.plug(later(t(2), "lol"));
      const filter = (value: string) => {
        return "lol" === value;
      };
      bus.plug(bus.filter(filter).map(() => "wut"));
      const dispose = bus.onValue(() => Bacon.more);
      return dispose();
    });
  });
  it("Removes input from input list on End event", function() {
    let subscribed = 0;
    const bus = new Bacon.Bus();
    const input = new Bacon.Bus();
    // override internal subscribe to track the subscribed-count
    const dispatcher = (<any>input).dispatcher
    const inputSubscribe = dispatcher.subscribe;
    dispatcher.subscribe = function(sink: any) {
      subscribed++;
      return inputSubscribe.call(input, sink);
    };
    bus.plug(input);
    const dispose = bus.onValue(() => Bacon.more);
    input.end();
    dispose();
    bus.onValue(() => Bacon.more); // this latter subscription should not go to the ended source anymore
    expect(subscribed).to.deep.equal(1);
  });
  it("unsubscribes inputs on end() call", function() {
    const bus = new Bacon.Bus<string>();
    const input = new Bacon.Bus<string>();
    const events: Bacon.Event<string>[] = [];
    bus.plug(input);
    bus.subscribe((e: Bacon.Event<string>) => {
      events.push(e)
      return Bacon.more
    });
    input.push("a");
    bus.end();
    input.push("b");
    expect(toValues(events)).to.deep.equal(["a", "<end>"]);
  });
  it("handles cold single-event streams correctly (bug fix)", function() {
    const values: string[] = [];
    const bus = new Bacon.Bus<string>();
    bus.plug(once("x"));
    bus.plug(once("y"));
    bus.onValue(x => {
      values.push(x)
      return Bacon.more
    });
    deferred(() => expect(values).to.deep.equal(["x", "y"]));
  });

  it("throws if a non-observable is plugged", () => expect(() => new Bacon.Bus<string>().plug(<any>undefined)).to.throw());

  describe("delivers pushed events and errors", () =>
    expectStreamEvents(
      function() {
        const s = new Bacon.Bus();
        s.push("pullMe");
        soon(function() {
          s.push("pushMe");
          s.error("");
          return s.end();
        });
        return s;
      },
      ["pushMe", error()])
  );

  it("does not deliver pushed events after end() call", function() {
    let called = false;
    const bus = new Bacon.Bus<string>();
    bus.onValue(() => {
      called = true
      return Bacon.more
    });
    bus.end();
    bus.push("LOL");
    expect(called).to.deep.equal(false);
  });

  it("does not plug after end() call", function() {
    let plugged = false;
    const bus = new Bacon.Bus();
    bus.end();
    bus.plug(new Bacon.EventStream(new Bacon.Desc("", ""), (sink) => { plugged = true; return Bacon.more; }));
    bus.onValue(() => Bacon.more);
    return expect(plugged).to.deep.equal(false);
  });

  it("respects end() even events comes from plugged stream", function() {
    let failed = false;
    const busA = new Bacon.Bus();
    const busB = new Bacon.Bus();
    busB.onValue(() => { failed = true; return Bacon.more });
    busB.plug(busA);
    busB.end();
    busA.push('foo');
    expect(failed).to.equal(false);
  });

  it("does not plug after end(), second variant", function() {
    let failed = false;
    const busA = new Bacon.Bus();
    const busB = new Bacon.Bus();
    busB.onValue(() => { failed = true; return Bacon.more });
    busB.plug(busA);
    busB.end();
    busA.push('foo');
    expect(failed).to.equal(false);
  });

  it("respects end() calls before subscribers", function() {
    let failed = false;
    const bus = new Bacon.Bus();
    bus.end();
    bus.onValue(() => { failed = true; return Bacon.more });
    bus.push('foo');
    deferred(() => expect(failed).to.deep.equal(false));
  });

  it("bounces End event to new subscribers after end() called, with subscribers", function() {
    let called = false;
    const bus = new Bacon.Bus();
    bus.onValue(() => Bacon.more);
    bus.end();
    bus.onEnd(() => { called = true; return Bacon.noMore });
    deferred(() => expect(called).to.equal(true));
  });

  it("bounces End event to new subscribers after end() called, without subscribers", function() {
    let called = false;
    const bus = new Bacon.Bus();
    bus.end();
    bus.onEnd(() => { called = true; return Bacon.noMore });
    deferred(() => expect(called).to.equal(true));
  });

  it("returns unplug function from plug", function() {
    const values: string[] = [];
    const bus = new Bacon.Bus<string>();
    const src = new Bacon.Bus<string>();
    const unplug = bus.plug(src);
    bus.onValue(x => { values.push(x); return Bacon.more });
    src.push("x");
    if (unplug !== undefined) {
      unplug()
    } else {
      throw Error("plug did not return unplug function")
    }
    src.push("y");
    expect(values).to.deep.equal(["x"]);
  });

  it("allows plugging a stream of subtype", function() {
    type TestObject = { a?: number; b?: string };
    const testBus = new Bacon.Bus<TestObject>();
    testBus.plug(Bacon.once(0).map((a) => ({ a })));
  })

  it("allows consumers to re-subscribe after other consumers have unsubscribed (bug fix)", function() {
    const bus = new Bacon.Bus<string>();
    const otherBus = new Bacon.Bus<string>();
    otherBus.plug(bus);
    const unsub = otherBus.onValue(() => Bacon.more);
    unsub()
    const o: string[] = [];
    otherBus.onValue(v => { o.push(v); return Bacon.more });
    bus.push("foo");
    return expect(o).to.deep.equal(["foo"]);
  });
  it("toString", () => expect(new Bacon.Bus().toString()).to.equal("Bacon.Bus()"));
});
