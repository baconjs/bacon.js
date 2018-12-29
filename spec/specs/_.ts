import { _ } from "../..";
import { expect } from "chai";

describe("Bacon._", () => {
  it("head", () => {
    expect(_.head([5,2,9])).to.equal(5);
    expect(_.head([])).to.equal(undefined);
  });
  it("always", () => {
    expect(_.always(5)()).to.equal(5)
  });
  it("negate", () => {
    expect(_.negate(_.always(true))("timanttikobra")).to.be.false
  });
  it("empty", () => {
    expect(_.empty([])).to.be.true;
    expect(_.empty([1])).to.be.false;
  });
  it("tail", () => {
    expect(_.tail([1,2,3])).to.deep.equal([2,3]);
    expect(_.tail([1])).to.deep.equal([]);
    expect(_.tail([])).to.deep.equal([]);
  });
  it("filter", () => {
    expect(_.filter(_.empty, ["","1",[],[2]])).to.deep.equal(["",[]])
  });
  it("map", () =>
    expect(_.map(_.head, [
      [], [1], [2,2], [3,3,3]
    ])).to.deep.equal([
      undefined, 1, 2, 3
    ])
  );
  it("flatMap", () => {
    expect(_.flatMap((x: number) => [x, x], [1,2,3])).to.deep.equal([1,1,2,2,3,3])
  });
  describe("each", () =>
      it("provides key and value to iterator", function() {
        const expectKeyVals = function(x: object, expectedKeys: string[], expectedValues: Array<string | number>) {
          const keys: string[] = [];
          const values: string[] = [];
          _.each(x, (key: string, value: string) => {
            keys.push(key);
            values.push(value);
          });
          expect([keys, values]).to.deep.equal([expectedKeys, expectedValues]);
        };
        expectKeyVals({ cat: "furry", bird: "feathery" }, ["cat","bird"], ["furry","feathery"]);
        expectKeyVals([1,2,3], ["0","1","2"], [1,2,3]);
      })
  );
  describe("toArray", () => {
    it("works", () => {
      expect(_.toArray(2)).to.deep.equal([2])
    });

    it("ignores rest of arguments", () => {
      expect(_.toArray(1)).to.deep.equal([1])
    });

    it("should, when given an array, return it back (not a copy)", () => {
      const arr: any[] = [];
      expect(_.toArray(arr)).to.equal(arr);
    });
  });
  it("indexOf", () => {
    expect(_.indexOf([1,2], 1)).to.equal(0);
    expect(_.indexOf([1,2], 2)).to.equal(1);
    expect(_.indexOf([1,2], 3)).to.equal(-1);
  });
  it("contains", () => {
    expect(_.contains([2,4,6], 4)).to.be.true;
    expect(_.contains([2,4,6], 3)).to.be.false;
    expect(_.contains)
  });
  it("id", () => {
    const obj = {};
    expect(_.id(obj)).to.equal(obj);
  });
  it("last", () => {
    expect(_.last([2,4])).to.equal(4)
  });
  it("all", () =>
      it("works", () => {
        expect(_.all([ [false,true], [true,true] ], _.head)).to.be.false;
        expect(_.all([ [true,false], [true,true] ], _.head)).to.be.true;
      })
  );
  describe("any", () =>
      it("works", () => {
        expect(_.any([ [false,true], [true,true] ], _.head)).to.be.true;
        expect(_.any([ [false,false], [false,true] ], _.head)).to.be.false;
      })
  );
  it("without", () => {
    expect(_.without("apple", ["bacon","apple","apple","omelette"])).to.deep.equal(["bacon","omelette"])
  });
  it("remove", () => {
    expect(_.remove("apple", ["bacon","apple","apple","omelette"])).to.deep.equal(["apple"]);
    expect(_.remove("raisin", ["bacon","apple","apple","omelette"])).to.deep.equal(undefined);
  });
  it("fold", () => {
    expect(_.fold([1,2,3,4,5], 0, (s: number, n: number) => s + n)).to.equal(15)
  });
  describe("toString", () => {
    it("for booleans", () => {
      expect(_.toString(true)).to.equal("true")
    });
    it("for strings", () => {
      expect(_.toString("lol")).to.equal("lol")
    });
    it("for dates", () => {
      expect(_.toString(new Date((new Date(0)).getTimezoneOffset() * 60 * 1000))).to.contain("1970")
    });
    it("for arrays", () => {
      expect(_.toString([1,2,3])).to.equal("[1,2,3]")
    });
    it("for numbers", () => {
      expect(_.toString(1)).to.equal("1");
      expect(_.toString(1.1)).to.equal("1.1");
    });
    it("for undefined and null", () => {
      expect(_.toString(undefined)).to.equal("undefined");
      expect(_.toString(null)).to.equal("undefined");
    });
    it("for objects", () => {
      expect(_.toString({a: "b"})).to.equal("{a:b}");
      expect(_.toString({a: "b", c: "d"})).to.equal("{a:b,c:d}");
    });
    it("for circular refs", () => {
      const obj = { name : "nasty", self: {}};
      obj.self = obj;
      expect(_.toString(obj).length).to.be.below(100);
    });
    it("works even when enumerable properties throw errors on access", () => {
      const obj = { "name": "madcow" };
      Object.defineProperty(obj, "prop", {
        enumerable: true,
        get() {
          throw new Error("an error");
        }
      });
      expect(_.toString(obj)).to.equal("{name:madcow,prop:Error: an error}");
    });
  });
});
