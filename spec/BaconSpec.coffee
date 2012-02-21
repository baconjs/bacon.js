Bacon = (require "../src/Bacon").Bacon

describe "Bacon", ->
  it "should be delicious", ->
    expect(Bacon.taste).toEqual("delicious")
