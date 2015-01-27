describe "Bacon._", ->
  _ = Bacon._
  describe "head", ->
    expect(_.head([5,2,9])).to.equal(5)
    expect(_.head([])).to.equal(undefined)
    expect(_.head(5)).to.equal(undefined)
  describe "always", -> expect(_.always(5)("francis")).to.equal(5)
  describe "negate", ->
    expect(_.negate(_.always(true))("timanttikobra")).to.be.false
  describe "empty", ->
    expect(_.empty([])).to.be.true
    expect(_.empty("")).to.be.true
    expect(_.empty([1])).to.be.false
    expect(_.empty("1")).to.be.false
  describe "tail", ->
    expect(_.tail([1,2,3])).to.deep.equal([2,3])
    expect(_.tail([1])).to.deep.equal([])
    expect(_.tail([])).to.deep.equal([])
  describe "filter", ->
    expect(_.filter(_.empty, ["","1",[],[2]])).to.deep.equal(["",[]])
  describe "map", ->
    expect(_.map(_.head, [
      [], [1], [2,2], [3,3,3]
    ])).to.deep.equal([
      undefined, 1, 2, 3
    ])
  describe "flatMap", ->
    expect(_.flatMap(((x) -> [x, x]), [1,2,3])).to.deep.equal([1,1,2,2,3,3])
  describe "each", ->
    it "provides key and value to iterator", ->
      expectKeyVals = (x, expectedKeys, expectedValues) ->
        keys = []
        values = []
        _.each(x, (key, value) ->
          keys.push(key)
          values.push(value)
        )
        expect([keys, values]).to.deep.equal([expectedKeys, expectedValues])
      expectKeyVals(
        {cat:"furry",bird:"feathery"}, ["cat","bird"], ["furry","feathery"]
      )
      expectKeyVals([1,2,3], ["0","1","2"], [1,2,3])
  describe "toArray", ->
    expect(_.toArray(2)).to.deep.equal([2])
    it "ignores rest of arguments", ->
      expect(_.toArray(1,1,2)).to.deep.equal([1])
    it "should, when given an array, return it back (not a copy)", ->
      arr = []
      expect(_.toArray(arr)).to.equal(arr)
  describe "indexOf", ->
    expect(_.indexOf([1,2], 1)).to.equal(0)
    expect(_.indexOf([1,2], 2)).to.equal(1)
    expect(_.indexOf([1,2], 3)).to.equal(-1)
  describe "contains", ->
    expect(_.contains("abc", "c")).to.be.true
    expect(_.contains("abc", "x")).to.be.false
    expect(_.contains([2,4,6], 4)).to.be.true
    expect(_.contains([2,4,6], 3)).to.be.false
  describe "id", ->
    obj = {}
    expect(_.id(obj)).to.equal(obj)
  describe "last", ->
    expect(_.last([2,4])).to.equal(4)
    expect(_.last("last")).to.equal("t")
  describe "all", ->
    expect(_.all([ [false,true], [true,true] ], _.head)).to.be.false
    expect(_.all([ [true,false], [true,true] ], _.head)).to.be.true
    it "should test truthiness if no function given", ->
      expect(_.all([true, false, true])).to.be.false
      expect(_.all([true, true, true])).to.be.true
      expect(_.all([1, true, 1])).to.be.true
  describe "any", ->
    expect(_.any([ [false,true], [true,true] ], _.head)).to.be.true
    expect(_.any([ [false,false], [false,true] ], _.head)).to.be.false
    it "should test truthiness if no function given", ->
      expect(_.any([false, false, false])).to.be.false
      expect(_.any([true, false, true])).to.be.true
  describe "without", ->
    expect(_.without("apple", ["bacon","apple","apple","omelette"]))
      .to.deep.equal(["bacon","omelette"])
  describe "remove", ->
    expect(_.remove("apple", ["bacon","apple","apple","omelette"]))
      .to.deep.equal(["apple"])
    expect(_.remove("raisin", ["bacon","apple","apple","omelette"]))
      .to.deep.equal(undefined)
  describe "fold", ->
    expect(_.fold([1,2,3,4,5], 0, (s, n) -> s + n)).to.equal(15)
  describe "toString", ->
    it "for booleans", ->
      expect(_.toString(true)).to.equal("true")
    it "for numbers", ->
      expect(_.toString(1)).to.equal("1")
      expect(_.toString(1.1)).to.equal("1.1")
    it "for undefined and null", ->
      expect(_.toString(undefined)).to.equal("undefined")
      expect(_.toString(null)).to.equal("undefined")
    it "for strings", ->
      expect(_.toString("lol")).to.equal("lol")
    it "for dates", ->
      expect(_.toString(new Date((new Date(0)).getTimezoneOffset() * 60 * 1000))).to.contain("1970")
    it "for arrays", ->
      expect(_.toString([1,2,3])).to.equal("[1,2,3]")
    it "for objects", ->
      expect(_.toString({a: "b"})).to.equal("{a:b}")
      expect(_.toString({a: "b", c: "d"})).to.equal("{a:b,c:d}")
    it "for circular refs", ->
      obj = { name : "nasty" }
      obj.self = obj
      expect(_.toString(obj).length).to.be.below(100)
    it "works even when enumerable properties throw errors on access", ->
      obj = { "name": "madcow" }

      Object.defineProperty obj, "prop",
        enumerable: true
        get: ->
          throw new Error "an error"

      expect(_.toString(obj)).to.equal("{name:madcow,prop:Error: an error}")




