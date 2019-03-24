/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as Bacon from "../..";
import { expect } from "chai";
import { expectPropertyEvents, later, fromArray } from "./util/SpecHelper";

describe("combineTemplate", function() {
  describe("combines streams and properties according to a template object", () =>
    expectPropertyEvents(
      function() {
         const name = Bacon.constant({first:"jack", last:"bauer"});
         const stuff = later(1, { key: "value" });
         return Bacon.combineTemplate({ name, stuff });
       },
      [{ name: { first:"jack", last:"bauer"}, stuff: {key:"value"}}])
  );
  describe("combines properties according to a template object", () =>
    expectPropertyEvents(
      function() {
         const firstName = Bacon.constant("juha");
         const lastName = Bacon.constant("paananen");
         const userName = Bacon.constant("mr.bacon");
         return Bacon.combineTemplate({ userName, password: "*****", fullName: { firstName, lastName }});
       },
      [{ userName: "mr.bacon", password: "*****", fullName: { firstName: "juha", lastName: "paananen" } }])
  );
  describe("works with a single-stream template", () =>
    expectPropertyEvents(
      function() {
        const bacon = Bacon.constant("bacon");
        return Bacon.combineTemplate({ favoriteFood: bacon });
      },
      [{ favoriteFood: "bacon" }])
  );
  describe("works when dynamic part is not the last part (bug fix)", () =>
    expectPropertyEvents(
      function() {
        const username = Bacon.constant("raimohanska");
        const password = Bacon.constant("easy");
        return Bacon.combineTemplate({url: "/user/login",
        data: { username, password }, type: "post"});
      },
      [{url: "/user/login", data: {username: "raimohanska", password: "easy"}, type: "post"}])
  );

  describe("works with arrays as data (bug fix)", () =>
    expectPropertyEvents(
      () => Bacon.combineTemplate( { x : Bacon.constant([]), y : Bacon.constant([[]]), z : Bacon.constant(["z"])}),
      [{ x : [], y : [[]], z : ["z"]}])
  );

  describe("constant objects supported", function() {
    const testAsRoot = (value: any) => expectPropertyEvents( (() => Bacon.combineTemplate(value)), [value]);
    const testAsObjectValue = (value: any) => testAsRoot({key: value});
    const testAsDynamicObjectValue = (value: any) => expectPropertyEvents( (() => Bacon.combineTemplate({key: Bacon.constant(value)})), [{ key: value}]);
    const testAsArrayItem = (value: any) => testAsRoot([1, value, 2]);

    const testConstantTypes = function(testConstant: ((value: any) => any)) {
      describe("empty object", () => testConstant({}));
      describe("numbers", () => testConstant(1));
      describe("null", () => testConstant(null));
      describe("NaN", () => testConstant(NaN));
      describe("dates", () => testConstant(new Date()));
    };

    describe("as root template", () => testConstantTypes(testAsRoot));
    describe("as static value in object", () => testConstantTypes(testAsObjectValue));
    describe("as dynamic value in object", () => testConstantTypes(testAsDynamicObjectValue));
    describe("as array item", () => testConstantTypes(testAsArrayItem));
  });

  describe("supports empty object", () =>
    expectPropertyEvents(
      () => Bacon.combineTemplate({}),
      [{}])
  );
  it("supports arrays", function() {
    let value: any = {key: [{ x: 1 }, { x: 2 }]};
    Bacon.combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal(value);
      expect(x.key instanceof Array).to.deep.equal(true);
    }); // seems that the former passes even if x is not an array
    value = [{ x: 1 }, { x: 2 }];
    Bacon.combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal(value);
      expect(x instanceof Array).to.deep.equal(true);
    });
    value = {key: [{ x: 1 }, { x: 2 }], key2: {}};
    Bacon.combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal(value);
      expect(x.key instanceof Array).to.deep.equal(true);
    });
    value = {key: [{ x: 1 }, { x: Bacon.constant(2) }]};
    return Bacon.combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal({key: [{ x: 1 }, { x: 2 }]});
      expect(x.key instanceof Array).to.deep.equal(true);
    });
  }); // seems that the former passes even if x is not an array
  it("supports NaNs", function() {
    const value = {key: NaN};
    return Bacon.combineTemplate(value).onValue((x : any) => {expect(isNaN(x.key)).to.deep.equal(true)});
  });
  it("supports dates", function() {
    const value = {key: new Date()};
    return Bacon.combineTemplate(value).onValue(x => {expect(x).to.deep.equal(value)});
  });
  it("supports regexps", function() {
    const value = {key: /[0-0]/i};
    return Bacon.combineTemplate(value).onValue(x => {expect(x).to.deep.equal(value)});
  });
  it("supports functions", function() {
    const value = {key() {}};
    return Bacon.combineTemplate(value).onValue(x => {expect(x).to.deep.equal(value)});
  });
  it("toString", () => expect(Bacon.combineTemplate({ thing: Bacon.never(), const: "a" }).toString()).to.equal("Bacon.combineTemplate({thing:Bacon.never(),const:a})"));
  it("uses original objects as values (bugfix #615)", function() {
    class Foo {
      do() {
      }
    };
    
    const value = {foo1: new Foo(), foo2: Bacon.constant(new Foo())};
    return Bacon.combineTemplate(value).onValue(function({foo1, foo2}) {
      expect(foo1).to.be.instanceof(Foo);
      expect(foo1).to.have.property('do');
      expect(foo2).to.be.instanceof(Foo);
      expect(foo2).to.have.property('do');
    });
  });
  it("does not mutate original template objects", function() {
    const value = {key: fromArray([1, 2])};
    return Bacon
      .combineTemplate(value)
      .slidingWindow(2, 2)
      .onValue(function([first, second]) {
        expect(first).to.not.equal(second);
    });
  });
  it("uses original object instances when possible", function() {
    const object = {};
    Bacon
      .combineTemplate(object)
      .onValue(x => { expect(x).to.equal(object) });
    return Bacon
      .combineTemplate({a: object})
      .map((x: any) => x.a)
      .onValue(x => { expect(x).to.equal(object) });
  });
});
