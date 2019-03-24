import * as Bacon from "..";
import { expect } from "chai";
import { expectStreamEvents, error } from "./util/SpecHelper";
import * as Bluebird from "bluebird";

describe("Bacon.fromPromise", function() {
  describe("With Bluebird", function() {
    describe("on success", () =>
      expectStreamEvents(
        () => Bacon.fromPromise(new Bluebird(function(res, rej) { return res("ok"); }) as any),
        ["ok"])
    );
    return describe("on error", () =>
      expectStreamEvents(
        () => Bacon.fromPromise(new Bluebird(function(res, rej) { return rej("fail"); }) as any),
        [error("fail")])
    );
  });
  return describe("With mock Promise", function() {
    let success: any = undefined;
    let fail: any = undefined;
    let calls = 0;
    let promise = (<any> {
      then(s: any, f: any) {
        success = s;
        fail = f;
        return calls = calls + 1;
      }
    }) as Promise<string>;
    const { _ } = Bacon;
    const nop = function() {};

    it("should produce value and end on success", function() {
      const events: Bacon.Event<string>[] = [];
      Bacon.fromPromise(promise).subscribe( e => { events.push(e) });
      success("a");
      return expect(_.map((e => e.toString()), events)).to.deep.equal(["a", "<end>"]);
    });

    it("should produce error and end on error", function() {
      const events: Bacon.Event<string>[] = [];
      Bacon.fromPromise(promise).subscribe( e => { events.push(e) });
      fail("a");
      return expect(events.map(e => e.toString())).to.deep.equal(["<error> a", "<end>"]);
    });

    it("should respect unsubscription", function() {
      const events: Bacon.Event<string>[] = [];
      const dispose = Bacon.fromPromise(promise).subscribe( e => { events.push(e) });
      dispose();
      success("a");
      return expect(events).to.deep.equal([]);
    });

    it("should support custom event transformer", function() {
      const transformer = (value: string) => [value.toUpperCase(), new Bacon.End];
      const events: Bacon.Event<string>[] = [];
      Bacon.fromPromise(promise, false, transformer).subscribe( e => { events.push(e) });
      success("a");
      return expect(_.map((e => e.toString()), events)).to.deep.equal(["A", "<end>"]);
    });

    it("should abort ajax promise on unsub, if abort flag is set", function() {
      let isAborted = false;
      (<any>promise).abort = () => isAborted = true;
      const dispose = Bacon.fromPromise(promise, true).subscribe(nop);
      dispose();
      delete (<any>promise).abort;
      return expect(isAborted).to.deep.equal(true);
    });

    it("should not abort ajax promise on unsub, if abort flag is not set", function() {
      let isAborted = false;
      (<any>promise).abort = () => isAborted = true;
      const dispose = Bacon.fromPromise(promise).subscribe(nop);
      dispose();
      delete (<any>promise).abort;
      return expect(isAborted).to.deep.equal(false);
    });

    it("should not abort non-ajax promise", function() {
      const isAborted = false;
      const dispose = Bacon.fromPromise(promise).subscribe(nop);
      dispose();
      return expect(isAborted).to.deep.equal(false);
    });


    return describe('with kind of promise-chain that ends with .done()', function() {
      let stream: Bacon.EventStream<string> | undefined = undefined;
      let chainEnd = false;
      beforeEach(function() {
        chainEnd = false;
        // this promise tries to mimick the behaviour of kriskowal/q, where
        // not calling .done() at the end of the chain will result in
        // exceptions going nowhere.
        promise = <any> {
          then(s: any, f: any) {
            fail = function(v: string) {
              try {
                return f(v);
              } catch (err) {
                if (chainEnd) { throw err; }
              }
            };
            success = function(v: string) {
              try {
                return s(v);
              } catch (err) {
                if (chainEnd) { throw err; } else { return fail(err); }
              }
            };
            return {done() { return chainEnd = true; }};
          }
        };
        return stream = Bacon.fromPromise(promise);
      });

      it("should not swallow .onValue() errors", function() {
        stream && stream.onValue(function(e: string) { throw new Error("fail value"); });
        return expect(() => success('success')).to.throw('fail value');
      });

      return it("should not swallow .onError() errors", function() {
        stream && stream.onError(function(e: string) { throw new Error("fail error"); });
        return expect(() => fail('fail')).to.throw('fail error');
      });
    });
  });
});
