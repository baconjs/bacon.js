import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents } from "./util/SpecHelper";

describe("Bacon.fromBinder", function() {
  describe("Provides an easier alternative to the EventStream constructor, allowing sending multiple events at a time", () =>
    expectStreamEvents(
      () =>
        Bacon.fromBinder(function(sink) {
          sink([new Bacon.Next(1), new Bacon.End()]);
          return (function() {});
        })
      ,
      [1])
  );
  describe("Allows sending unwrapped values as well as events", () =>
    expectStreamEvents(
      () =>
        Bacon.fromBinder(function(sink) {
          sink([1, new Bacon.End()]);
          return (function() {});
        })
      ,
      [1])
  );
  describe("Allows sending single value without wrapping array", () =>
    expectStreamEvents(
      () =>
        Bacon.fromBinder(function(sink) {
          sink(1);
          sink(new Bacon.End());
          return (function() {});
        })
      ,
      [1])
  );
  describe("unbind works in synchronous case", () =>
    expectStreamEvents( () =>
        Bacon.fromBinder(function(sink) {
          const unsubTest = Bacon.getScheduler().setInterval((function() {}), 10);
          sink("hello");
          sink(new Bacon.End());
          return () =>
            // test hangs if any interval is left uncleared
            Bacon.getScheduler().clearInterval(unsubTest)
          ;
        })
      
      ,
      ["hello"])
  );

  it("calls unbinder only once", function() {
    let unbound = 0;
    let output: any = undefined;
    const timer = Bacon.fromBinder(function(sink) {
        output = sink;
        return () => unbound++;
    });
    timer.onValue(() => Bacon.noMore);
    output && output("hello");
    expect(unbound).to.equal(1);
  });

  it("toString", () => expect(Bacon.fromBinder(<any>function() {}).toString()).to.equal("Bacon.fromBinder(function,function)"));
});
