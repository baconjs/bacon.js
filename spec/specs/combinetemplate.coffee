Bacon = require("../../dist/Bacon")
expect = require("chai").expect
{
  expectPropertyEvents,
  later,
  once,
  fromArray,
} = require("../SpecHelper")
{ mockFunction } = require( "../Mock")

describe "combineTemplate", ->
  describe "combines streams and properties according to a template object", ->
    expectPropertyEvents(
      ->
         name = Bacon.constant({first:"jack", last:"bauer"})
         stuff = later(1, { key: "value" })
         Bacon.combineTemplate({ name, stuff })
      [{ name: { first:"jack", last:"bauer"}, stuff: {key:"value"}}])
  describe "combines properties according to a template object", ->
    expectPropertyEvents(
      ->
         firstName = Bacon.constant("juha")
         lastName = Bacon.constant("paananen")
         userName = Bacon.constant("mr.bacon")
         Bacon.combineTemplate({ userName: userName, password: "*****", fullName: { firstName: firstName, lastName: lastName }})
      [{ userName: "mr.bacon", password: "*****", fullName: { firstName: "juha", lastName: "paananen" } }])
  describe "works with a single-stream template", ->
    expectPropertyEvents(
      ->
        bacon = Bacon.constant("bacon")
        Bacon.combineTemplate({ favoriteFood: bacon })
      [{ favoriteFood: "bacon" }])
  describe "works when dynamic part is not the last part (bug fix)", ->
    expectPropertyEvents(
      ->
        username = Bacon.constant("raimohanska")
        password = Bacon.constant("easy")
        Bacon.combineTemplate({url: "/user/login",
        data: { username: username, password: password }, type: "post"})
      [url: "/user/login", data: {username: "raimohanska", password: "easy"}, type: "post"])

  describe "works with arrays as data (bug fix)", ->
    expectPropertyEvents(
      -> Bacon.combineTemplate( { x : Bacon.constant([]), y : Bacon.constant([[]]), z : Bacon.constant(["z"])})
      [{ x : [], y : [[]], z : ["z"]}])

  describe "constant objects supported", ->
    testAsRoot = (value) -> expectPropertyEvents( (-> Bacon.combineTemplate(value)), [value])
    testAsObjectValue = (value) -> testAsRoot({key: value})
    testAsDynamicObjectValue = (value) -> expectPropertyEvents( (-> Bacon.combineTemplate({key: Bacon.constant(value)})), [{ key: value}])
    testAsArrayItem = (value) -> testAsRoot([1, value, 2])

    testConstantTypes = (testConstant) ->
      describe "empty object", -> testConstant({})
      describe "numbers", -> testConstant(1)
      describe "null", -> testConstant(null)
      describe "NaN", -> testConstant(NaN)
      describe "dates", -> testConstant(new Date())

    describe "as root template", ->
      testConstantTypes(testAsRoot)
    describe "as static value in object", ->
      testConstantTypes(testAsObjectValue)
    describe "as dynamic value in object", ->
      testConstantTypes(testAsDynamicObjectValue)
    describe "as array item", ->
      testConstantTypes(testAsArrayItem)

  describe "supports empty object", ->
    expectPropertyEvents(
      -> Bacon.combineTemplate({})
      [{}])
  it "supports arrays", ->
    value = {key: [{ x: 1 }, { x: 2 }]}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
      expect(x.key instanceof Array).to.deep.equal(true) # seems that the former passes even if x is not an array
    value = [{ x: 1 }, { x: 2 }]
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
      expect(x instanceof Array).to.deep.equal(true)
    value = {key: [{ x: 1 }, { x: 2 }], key2: {}}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
      expect(x.key instanceof Array).to.deep.equal(true)
    value = {key: [{ x: 1 }, { x: Bacon.constant(2) }]}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal({key: [{ x: 1 }, { x: 2 }]})
      expect(x.key instanceof Array).to.deep.equal(true) # seems that the former passes even if x is not an array
  it "supports NaNs", ->
    value = {key: NaN}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(isNaN(x.key)).to.deep.equal(true)
  it "supports dates", ->
    value = {key: new Date()}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
  it "supports regexps", ->
    value = {key: /[0-0]/i}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
  it "supports functions", ->
    value = {key: ->}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
  it "toString", ->
    expect(Bacon.combineTemplate({ thing: Bacon.never(), const: "a" }).toString()).to.equal("Bacon.combineTemplate({thing:Bacon.never(),const:a})")
  it "uses original objects as values (bugfix #615)", ->
    Foo = ->
    Foo::do = ->

    value = {foo1: new Foo(), foo2: Bacon.constant(new Foo())}
    Bacon.combineTemplate(value).onValue ({foo1, foo2}) ->
      expect(foo1).to.be.instanceof(Foo)
      expect(foo1).to.have.property('do')
      expect(foo2).to.be.instanceof(Foo)
      expect(foo2).to.have.property('do')
  it "does not mutate original template objects", ->
    value = {key: fromArray([1, 2])}
    Bacon
      .combineTemplate(value)
      .slidingWindow(2, 2)
      .onValue ([first, second]) ->
        expect(first).to.not.equal(second)
  it "uses original object instances when possible", ->
    object = {}
    Bacon
      .combineTemplate(object)
      .onValue (x) ->
        expect(x).to.equal(object)
    Bacon
      .combineTemplate({a: object})
      .map((x) => x.a)
      .onValue (x) ->
        expect(x).to.equal(object)
