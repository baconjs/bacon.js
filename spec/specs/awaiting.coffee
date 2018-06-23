Bacon = require("../../dist/Bacon")

{ expectPropertyEvents, unstable, semiunstable, later, series } = require("../SpecHelper")
expect = require("chai").expect

describe "EventStream.awaiting(other)", ->
  describe "indicates whether s1 has produced output after s2 (or only the former has output so far)", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).awaiting(series(3, [2]))
      [false, true, false, true], semiunstable)
  describe "supports awaiting Properties", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).awaiting(series(3, [2]).toProperty())
      [false, true, false, true], semiunstable)
  describe "supports simultaneouts events", ->
    expectPropertyEvents(
      ->
        src = later(1, 1)
        src.awaiting(src.map(->))
      [false])
    expectPropertyEvents(
      ->
        src = later(1, 1)
        src.map(->).awaiting(src)
      [false])
  it "toString", ->
    expect(Bacon.never().awaiting(Bacon.never()).toString()).to.equal("Bacon.never().awaiting(Bacon.never())")

describe "Property.awaiting(eventstream)", ->
  describe "indicates whether p1 has produced output after p2 (or only the former has output so far)", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).toProperty().awaiting(series(3, [2]))
      [false, true, false, true], semiunstable)

describe "Property.awaiting(property)", ->
  describe "works for awaiting self", ->
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.awaiting(p)
      [false])
  describe "indicates whether p1 has produced output after p2 (or only the former has output so far)", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).toProperty().awaiting(series(3, [2]).toProperty())
      [false, true, false, true], semiunstable)
  describe "works for awaiting slf.map", ->
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.awaiting(p.map(->))
      [false])
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.map().awaiting(p.map(->))
      [false])
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.map(->).awaiting(p)
      [false])
  describe "works for awaiting self.flatMap", ->
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.awaiting(p.flatMap((x) -> Bacon.once(x)))
      [true, false], unstable)

describe "EventStream.awaiting(property)", ->
  describe "works correctly when EventStream emits first", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).awaiting(series(3, [2]))
      [false, true, false, true], semiunstable)
  describe "works correctly when Property emits first", ->
    expectPropertyEvents(
      -> series(3, [1]).awaiting(series(2, [2, 2]))
      [false, true, false], semiunstable)
