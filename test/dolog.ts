import * as Bacon from "..";
import { expect } from "chai";

import { once, deferred } from "./util/SpecHelper";


describe("Observable.doLog", function() {
  const originalLog = console.log;

  const restoreLog = () => {
    global.console.log = originalLog;
  };

  const preservingLog = (f: Function): any => {
    try {
      return f();
    } catch (e) {
      originalLog(e)
    } finally {
      restoreLog();
    }
  };

  it("does not consume the event", function(done) {
    const streamWithOneEvent = once({}).doLog('hello bacon');
    streamWithOneEvent.onValue(() => { done(); return undefined });
  });
 it("does not crash", () =>
    preservingLog(() => {
      console.log = function() {};
      Bacon.constant(1).doLog().onValue();
    })
  );
  it("does not crash in case console.log is not defined", () =>
    preservingLog(() => {
      console.log = <any>undefined;
      Bacon.constant(1).doLog().onValue();
    })
  );
  it("logs event values as themselves (doesn't stringify), and End events as strings", function() {
    const loggedValues: string[][] = [];
    preservingLog(() => {
      console.log = (...args: string[]) => loggedValues.push(args);
      Bacon.constant(1).doLog(true).onValue(() => undefined);
    });
    expect(loggedValues).to.deep.equal([[true, 1],[true, "<end>"]]);
  });
  it("logs Error events as strings", function() {
    const loggedValues: string[][] = [];
    console.log = (...args: string[]) => loggedValues.push(args);
    once(new Bacon.Error('err')).doLog(true).onValue(() => undefined);
    return deferred(() => { 
      restoreLog();
      expect(loggedValues).to.deep.equal([[true, "<error> err"], [true, '<end>']]);
    });
  });
  it("toString", () => expect(Bacon.never().doLog().toString()).to.equal("Bacon.never().doLog()"));
});
