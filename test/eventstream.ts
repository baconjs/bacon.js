import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, testSideEffects, once, deferred } from "./util/SpecHelper";

describe("EventStream constructor", () =>
  it("Provides a way to create a new EventStream", function() {
    const values: string[] = [];
    const subscribe = function(sink: Bacon.EventSink<string>) {
      sink(new Bacon.Next("hello"));
      sink(new Bacon.End());
      return function() {};
    };
    const s = new Bacon.EventStream(new Bacon.Desc("context", "method", ["arg"]), subscribe);
    s.onValue(x => { values.push(x); return Bacon.more });
    expect(s.toString()).to.equal("context.method(arg)");
    deferred(() => expect(values).to.deep.equal(["hello"]));
  })
);

describe("Observable.name", function() {
  it("sets return value of toString and inspect", function() {
    expect(Bacon.never().name("one").toString()).to.equal("one");
    expect(Bacon.never().name("one").inspect()).to.equal("one");
  });
  it("modifies the stream in place", function() {
    const obs = Bacon.never();
    obs.name("one");
    expect(obs.toString()).to.equal("one");
  });
  it("supports composition", () => expect(Bacon.never().name("raimo").toProperty().inspect()).to.equal("raimo.toProperty()"));
});

describe("Observable.withDescription", function() {
  it("affects toString and inspect", () => expect(Bacon.never().withDescription("Bacon", "una", "mas").inspect()).to.equal("Bacon.una(mas)"));
  it("affects desc", function() {
    const description = Bacon.never().withDescription("Bacon", "una", "mas").desc;
    expect(description.context).to.equal("Bacon");
    expect(description.method).to.equal("una");
    expect(description.args).to.deep.equal(["mas"]);
  });
});

describe("EventStream.subscribe", () =>
  it("asserts that argument is function", function() {
    const f = () => Bacon.never<string>().subscribe(<any>"a string");
    expect(f).to.throw(Error);
  })
);

describe("EventStream.onValue", testSideEffects(once, "onValue"));
describe("EventStream.forEach", testSideEffects(once, "forEach"));
describe("Bacon.never", () =>
  describe("should send just end", () =>
    expectStreamEvents(
      () => Bacon.never(),
      [])
  )
);
