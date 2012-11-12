describe("asEventStream", function() {
  it("returns 0", function() {
    var mock = sinon.spy()
    $("body").asEventStream("click").take(1).onValue(mock)
    $("body").click()
    expect(mock.callCount).to.equal(1)
  })
  it("supports jQuery live selector format", function() {
    var mock = sinon.spy()
    $("html").asEventStream("click", "body").take(1).onValue(mock)
    $("body").click()
    expect(mock.callCount).to.equal(1)
  })
})
