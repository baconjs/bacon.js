import { Property, constant, combineTemplate, never } from "..";
import * as Bacon from "..";
import { expect } from "chai";
import { expectPropertyEvents, later, fromArray } from "./util/SpecHelper";

describe("combineTemplate", function() {
  describe("combines streams and properties according to a template object", () =>
    expectPropertyEvents(
      function() {
         const name = constant({first:"jack", last:"bauer"});
         const stuff = later(1, { key: "value" });
         return <Property<{name: { first: string, last: string }, stuff: string}>>combineTemplate({ name, stuff });
       },
      [{ name: { first:"jack", last:"bauer"}, stuff: {key:"value"}}])
  );
  describe("combines properties according to a template object", () =>
    expectPropertyEvents(
      function() {
         const firstName = constant("juha");
         const lastName = constant("paananen");
         const userName = constant("mr.bacon");
         return combineTemplate({ userName, password: "*****", fullName: { firstName, lastName }});
       },
      [{ userName: "mr.bacon", password: "*****", fullName: { firstName: "juha", lastName: "paananen" } }])
  );
  describe("works with a single-stream template", () =>
    expectPropertyEvents(
      function() {
        const bacon = constant("bacon");
        return <Property<{ favoriteFood: string }>>combineTemplate({ favoriteFood: bacon });
      },
      [{ favoriteFood: "bacon" }])
  );
  describe("works when dynamic part is not the last part (bug fix)", () =>
    expectPropertyEvents(
      function() {
        const username = constant("raimohanska");
        const password = constant("easy");
        return combineTemplate({url: "/user/login",
        data: { username, password }, type: "post"});
      },
      [{url: "/user/login", data: {username: "raimohanska", password: "easy"}, type: "post"}])
  );

  describe("works with arrays as data (bug fix)", () =>
    expectPropertyEvents(
      () => combineTemplate( { x : constant([]), y : constant([[]]), z : constant(["z"])}),
      [{ x : [], y : [[]], z : ["z"]}])
  );

  describe("constant objects supported", function() {
    const testAsRoot = (value: any) => expectPropertyEvents( (() => combineTemplate(value)), [value]);
    const testAsObjectValue = (value: any) => testAsRoot({key: value});
    const testAsDynamicObjectValue = (value: any) => expectPropertyEvents( (() => combineTemplate({key: constant(value)})), [{ key: value}]);
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
      () => combineTemplate({}),
      [{}])
  );
  it("supports arrays", function() {
    let value: any = {key: [{ x: 1 }, { x: 2 }]};
    combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal(value);
      expect(x.key instanceof Array).to.deep.equal(true);
    }); // seems that the former passes even if x is not an array
    value = [{ x: 1 }, { x: 2 }];
    combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal(value);
      expect(x instanceof Array).to.deep.equal(true);
    });
    value = {key: [{ x: 1 }, { x: 2 }], key2: {}};
    combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal(value);
      expect(x.key instanceof Array).to.deep.equal(true);
    });
    value = {key: [{ x: 1 }, { x: constant(2) }]};
    return combineTemplate(value).onValue(function(x: any) {
      expect(x).to.deep.equal({key: [{ x: 1 }, { x: 2 }]});
      expect(x.key instanceof Array).to.deep.equal(true);
    });
  }); // seems that the former passes even if x is not an array
  it("supports NaNs", function() {
    const value = {key: NaN};
    return combineTemplate(value).onValue((x : any) => {expect(isNaN(x.key)).to.deep.equal(true)});
  });
  it("supports dates", function() {
    const value = {key: new Date()};
    return combineTemplate(value).onValue(x => {expect(x).to.deep.equal(value)});
  });
  it("supports regexps", function() {
    const value = {key: /[0-0]/i};
    return combineTemplate(value).onValue(x => {expect(x).to.deep.equal(value)});
  });
  it("supports functions", function() {
    const value = {key() {}};
    return combineTemplate(value).onValue(x => {expect(x).to.deep.equal(value)});
  });
  it("toString", () => expect(combineTemplate({ thing: never(), const: "a" }).toString()).to.equal("Bacon.combineTemplate({thing:Bacon.never(),const:a})"));
  it("uses original objects as values (bugfix #615)", function() {
    class Foo {
      do() {
      }
    };
    
    const value = {foo1: new Foo(), foo2: constant(new Foo())};
    return combineTemplate(value).onValue(function({foo1, foo2}) {
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
