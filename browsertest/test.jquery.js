describe("asEventStream", function() {
  it("supports simple format", function() {
    var mock = sinon.spy()
    $("body").asEventStream("click").map(elemName).take(1).onValue(mock)
    $("body").click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal("body")
  })
  it("supports jQuery live selector format", function() {
    var mock = sinon.spy()
    $("html").asEventStream("click", "body").map(elemName).take(1).onValue(mock)
    $("body").click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal("body")
  })
  it("supports optional eventTransformer, with jQuery live selector", function() {
    var mock = sinon.spy()
    var argsToArray = function() { return arguments }
    $("html").asEventStream("click", "body", elemName).take(1).onValue(mock)
    $("body").click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal("body")
  })
  it("supports optional eventTransformer, without jQuery live selector", function() {
    var mock = sinon.spy()
    var argsToArray = function() { return arguments }
    $("body").asEventStream("click", elemName).take(1).onValue(mock)
    $("body").click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal("body")
  })
  function elemName(event) {
    return event.target.localName
  }
})
