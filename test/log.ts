import * as Bacon from "..";
import { expect } from "chai";

// TODO: causes tests suite exit?!
describe.skip("Observable.log", function() {
  const preservingLog = function(f: any) {
    const originalConsole = console;
    const originalLog = console.log;
    try {
      f();
    } finally {
      global.console = originalConsole;
      console.log = originalLog;
    }
  };

  it("does not crash", () =>
    preservingLog(function() {
      console.log = function() {};
      Bacon.constant(1).log();
    })
  );
  it("does not crash in case console.log is not defined", () =>
    preservingLog(function() {
      console.log = <any>undefined;
      Bacon.constant(1).log();
    })
  );
  it("logs event values as themselves (doesn't stringify)", function() {
    const value = {};
    expect(new Bacon.Next(value).log()).to.equal(value);
  });
  it("logs Error, End events as strings", function() {
    expect(new Bacon.Error("err").log()).to.equal("<error> err");
    expect(new Bacon.End().log()).to.equal("<end>");
  });
  it("toString", () => expect(Bacon.never().log().toString()).to.equal("Bacon.never()"));
});
