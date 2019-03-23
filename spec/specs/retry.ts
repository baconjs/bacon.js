import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, error, fromArray, semiunstable } from "./util/SpecHelper";

describe("Bacon.retry", function() {
  describe("does not retry after value", () =>
    expectStreamEvents(
      function() {
        let calls = 0;
        const source = function() {
          calls += 1;
          return Bacon.once({calls});
        };
        return Bacon.retry({source, retries: 2});
      },
      [{calls: 1}])
  );
  describe("retries to run the source stream given number of times until it yields a value", () =>
    expectStreamEvents(
      function() {
        const calls: number[] = [];
        const source = function(count: number) {
          calls.push(count);
          if (calls.length < 3) {
            return Bacon.once(error());
          } else {
            return Bacon.once(calls);
          }
        };
        return Bacon.retry({source, retries: 5});
      },
      [[0, 1, 2]])
  );
  describe("does not change source stream characteristics", () =>
    expectStreamEvents(
      () => Bacon.retry({source() { return fromArray([3, 1, 2, 1, 3]).skipDuplicates().take(2); }}),
      [3, 1], semiunstable)
  );
  describe("retries after retryable error", () =>
    expectStreamEvents(
      function() {
        let calls = 0;
        const source = function() {
          calls += 1;
          return Bacon.once(new Bacon.Error({calls}));
        };
        const isRetryable = ({calls}: {calls: number}) => calls < 2;
        return Bacon.retry({source, isRetryable, retries: 5});
      },
      [error(<any>{calls: 2})])
  ); // TODO: assert error content (current test system doesn't look inside the error)
  describe("yields error when no retries left", () =>
    expectStreamEvents(
      function() {
        let calls = 0;
        const source = function() {
          calls += 1;
          return Bacon.once(new Bacon.Error({calls}));
        };
        return Bacon.retry({source, retries: 2});
      },
      [error(<any>{calls: 3})])
  ); // TODO: assert error content (current test system doesn't look inside the error)
  it("allows specifying delay by context for each retry", function(done) {
    let calls = 0;
    type Context = { error: { calls: number }, retriesDone: number}
    const contexts: Context[] = [];
    const source = function() {
      calls += 1;
      return Bacon.once(new Bacon.Error({calls}));
    };
    const delay = function(context: Context) {
      contexts.push(context);
      return 1;
    };
    return Bacon.retry({source, delay, retries: 2}).onError(function(err) {
      expect(contexts).to.deep.equal([
        {error: {calls: 1}, retriesDone: 0},
        {error: {calls: 2}, retriesDone: 1}
      ]);
      expect(err).to.deep.equal({calls: 3});
      return done();
    });
  });
  it("calls source function after delay", function(done) {
    let calls = 0;
    const source = function() {
      calls += 1;
      return Bacon.once(error());
    };
    //const interval = () => 100;
    Bacon.retry({source, retries: 1}).onValue(function() {}); // noop
    expect(calls).to.equal(1);
    return done();
  });
  describe("no stack overflows", () =>
    expectStreamEvents(
      function() {
        const source = () => Bacon.once(error());
        //const interval = () => 1;
        return Bacon.retry({source, retries: 1000});
      },
      [error()])
  );
  describe("Retries indefinitely if retries==0", () =>
    expectStreamEvents(
      function() {
        let counter = 0;
        const source = function() {
          counter++;
          if (counter < 100) {
            return Bacon.once(error());
          } else {
            return Bacon.once("success");
          }
        };
        //const interval = () => 1;
        return Bacon.retry({source, retries: 0});
      },
      ["success"])
  );
  it("throws exception if 'source' option is not a function", () => {
    expect(() => {
      Bacon.retry(<any>{source: "ugh"})
    }).to.throw("'source' option has to be a function");
  })
  return it("toString", () => expect(Bacon.retry({source() { return Bacon.once(1); }}).toString()).to.equals("Bacon.retry({source:function})"));
});
