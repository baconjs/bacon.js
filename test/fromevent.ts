import * as Bacon from "..";
import { expect } from "chai";
import { EventEmitter } from "events";
import { expectStreamEvents, take, deferred } from "./util/SpecHelper";

// Wrap EventEmitter as EventTarget
const toEventTarget = (emitter: any) =>
  ({
    addEventListener(event: any, handler: any) {
      return emitter.addListener(event, handler);
    },
    removeEventListener(event: any, handler: any) { return emitter.removeListener(event, handler); }
  })
;

describe("Bacon.fromEventTarget", () =>
  it("is legacy name for Bacon.fromEvent", () => expect(Bacon.fromEvent).to.equal(Bacon.fromEventTarget))
);

describe("Bacon.fromEvent", function() {
  const soon = (f: any) => setTimeout(f, 0);

  const onOffSource = function() { return {
    cleaned: false,
    on(type: any, callback: any) { callback(type); },
    off(callback: any) { this.cleaned = true; }
  }; };

  const bindUnbindSource = function() { return {
    cleaned: false,
    bind(type: any, callback: any) { callback(type); },
    unbind(callback: any) { this.cleaned = true; },
    on() { throw "bait method"; },
    addEventListener() { throw "bait method"; },
    addListener() { throw "bait method"; }
  }; };

  describe("eventSource is a string (the name of the event type to bind)", function() {
    describe("should create EventStream from DOM object", () =>
      expectStreamEvents(
        function() {
          const emitter = new EventEmitter();
          emitter.on("newListener", () => soon(() => emitter.emit("click", "x")));
          const element = toEventTarget(emitter);
          return take(1, Bacon.fromEvent(element, "click"));
        },
        ["x"]
      )
    );

    describe("should create EventStream from EventEmitter", () =>
      expectStreamEvents(
        function() {
          const emitter = new EventEmitter();
          emitter.on("newListener", () => soon(() => emitter.emit("data", "x")));
          return take(1, Bacon.fromEvent(emitter, "data"));
        },
        ["x"]
      )
    );

    describe("should allow a custom map function for EventStream from EventEmitter", () =>
      expectStreamEvents(
        function() {
          const emitter = new EventEmitter();
          emitter.on("newListener", () => soon(() => emitter.emit("data", "x", "y")));
          return take(1, Bacon.fromEvent(emitter, "data", (x, y) => [x, y]));
        },
        [["x", "y"]]
      )
    );

    it("should clean up event listeners from EventEmitter", function() {
      const emitter = new EventEmitter();
      take(1, Bacon.fromEvent(emitter, "data")).subscribe(function() {});
      emitter.emit("data", "x");
      return expect(emitter.listeners("data").length).to.deep.equal(0);
    });

    it("should clean up event listeners from DOM object", function() {
      const emitter = new EventEmitter();
      const element = toEventTarget(emitter);
      const dispose = Bacon.fromEvent(element, "click").subscribe(function() {});
      dispose();
      return expect(emitter.listeners("click").length).to.deep.equal(0);
    });

    it("should create EventStream from on/off event", function() {
      const values: string[] = [];
      const src = onOffSource();
      take(1, Bacon.fromEvent(src, "test")).onValue(value => {values.push(value)});
      return deferred(function() {
        expect(values).to.deep.equal(["test"]);
        return expect(src.cleaned).to.equal(true);
      });
    });

    it("should create EventStream even if removeListener method missing", function() {
      const values: string[] = [];
      const src = {
        addListener(type: any, callback: any) { return callback(type); }
      };
      take(1, Bacon.fromEvent(src, "test")).onValue(value => {values.push(value)});
      return deferred(() => expect(values).to.deep.equal(["test"]));
  });

    it("should create EventStream from bind/unbind event", function() {
      const values: string[] = [];
      const src = bindUnbindSource();
      take(1, Bacon.fromEvent(src, "test")).onValue(value => {values.push(value)});
      return deferred(function() {
        expect(values).to.deep.equal(["test"]);
        return expect(src.cleaned).to.equal(true);
      });
    });

    return it("toString", () => expect(Bacon.fromEvent(onOffSource(), "click").toString()).to.equal("Bacon.fromEvent({cleaned:false,on:function,off:function},click)"));
  });

  return describe("eventSource is a function (a custom bind/unbind handler)", function() {
    describe("should create EventStream from DOM object", () =>
      expectStreamEvents(
        function() {
          const emitter = new EventEmitter();
          emitter.on("newListener", () => soon(() => emitter.emit("click", "x")));
          const element = toEventTarget(emitter);
          return take(1, Bacon.fromEvent(element, (binder, listener) => binder("click", listener)));
        },
        ["x"]
      )
    );

    describe("should create EventStream from EventEmitter", () =>
      expectStreamEvents(
        function() {
          const emitter = new EventEmitter();
          emitter.on("newListener", () => soon(() => emitter.emit("data", "x")));
          return take(1, Bacon.fromEvent(emitter, (binder, listener) => binder("data", listener)));
        },
        ["x"]
      )
    );

    describe("should allow a custom map function for EventStream from EventEmitter", () =>
      expectStreamEvents(
        function() {
          const emitter = new EventEmitter();
          emitter.on("newListener", () => soon(() => emitter.emit("data", "x", "y")));
          return take(1, Bacon.fromEvent(
            emitter,
            (binder, listener) => binder("data", listener),
            (x, y) => [x, y]
          )
          );
        },
        [["x", "y"]]
      )
    );

    it("should clean up event listeners from EventEmitter", function() {
      const emitter = new EventEmitter();
      take(1, Bacon.fromEvent(emitter, (binder, listener) => binder("data", listener))).subscribe(function() {});
      emitter.emit("data", "x");
      return expect(emitter.listeners("data").length).to.deep.equal(0);
    });

    it("should clean up event listeners from DOM object", function() {
      const emitter = new EventEmitter();
      const element = toEventTarget(emitter);
      const dispose = Bacon.fromEvent(element, (binder, listener) => binder("click", listener)).subscribe(function() {});
      dispose();
      return expect(emitter.listeners("click").length).to.deep.equal(0);
    });

    it("should create EventStream from on/off event", function() {
      const values: string[] = [];
      const src = onOffSource();
      take(1, Bacon.fromEvent(src, (binder, listener) => binder("test", listener))).onValue(value => {values.push(value)});
      return deferred(function() {
        expect(values).to.deep.equal(["test"]);
        return expect(src.cleaned).to.equal(true);
      });
    });

    it("should create EventStream even if removeListener method missing", function() {
      const values: string[] = [];
      const src = {
        addListener(type: any, callback: any) { return callback(type); }
      };
      take(1, Bacon.fromEvent(src, (binder, listener) => binder("test", listener))).onValue(value => {values.push(value)});
      return deferred(() => expect(values).to.deep.equal(["test"]));
  });

    it("should create EventStream from bind/unbind event", function() {
      const values: string[] = [];
      const src = bindUnbindSource();
      take(1, Bacon.fromEvent(src, (binder, listener) => binder("test", listener))).onValue(value => {values.push(value)});
      return deferred(function() {
        expect(values).to.deep.equal(["test"]);
        return expect(src.cleaned).to.equal(true);
      });
    });

    return it("toString", () =>
      expect(Bacon.fromEvent(onOffSource(), (binder, listener) => binder("click", listener)).toString())
        .to.equal("Bacon.fromEvent({cleaned:false,on:function,off:function},function)")
    );
  });
});
