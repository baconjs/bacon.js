import * as Bacon from "../..";
import { expect } from "chai";
import { later, sequentially, fromArray, once } from "./util/SpecHelper";

import * as Bluebird from "bluebird";

describe("firstToPromise", function() {
  it("picks the first event from Observable, later", () => {
    later(3, "foobar").firstToPromise().then(x => expect(x).to.equal("foobar"))
  });

  it("picks the first event from Observable, sequentially", () => {
    sequentially(3, [1, 2, 3]).firstToPromise().then(x => expect(x).to.equal(1))
  });

  return it.skip("never resolves with undefined from empty Observable", () => {
    sequentially(3, []).firstToPromise().then(x => expect(x).to.equal(undefined))
  });
});

describe("toPromise", function() {
  it("picks the last event from Observable, later", () => {
    later(3, "foobar").toPromise().then(x => expect(x).to.equal("foobar"))
  });

  it("works with synchronous sources", () => {
    fromArray([1,2,3]).toPromise().then(x => expect(x).to.equal(3))
  });

  it("picks the last event from Observable, sequentially", () => {
    sequentially(3, [1, 2, 3]).toPromise().then(x => expect(x).to.equal(3))
  });

  it("never resolves with undefined from empty Observable", function() {
    let called = false;
    Bacon.never().toPromise().then(() => called = true);
    return expect(called).to.equal(false);
  });

  return it("supports custom Promise constructor", function() {
    const promise = once("hi").toPromise(Bluebird);
    expect(promise.constructor).to.equal(Bluebird);
    return promise.then(x => expect(x).to.equal("hi"));
  });
});
