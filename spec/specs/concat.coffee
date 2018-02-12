require("../../src/bus")
require("../../src/doaction")
require("../../src/never")
require("../../src/takewhile")
require("../../src/concat")
require("../../src/property")
require("../../src/eventstream")
Bacon = require("../../src/core").default
expect = require("chai").expect
{
  expectStreamEvents,
  expectPropertyEvents,
  series,
  error,
  once,
  take,
  fromArray,
  semiunstable,
  lessThan,
  repeat,
  unstable,
  sequentially
} = require("../SpecHelper")
describe "Property.concat", ->
  describe "provides values from streams in given order and ends when both are exhausted", ->
    expectPropertyEvents(
      ->
        left = series(2, [1, error(), 2, 3]).toProperty()
        right = series(1, [4, 5, 6]).toProperty()
        left.concat(right)
      [1, error(), 2, 3, 4, 5, 6], semiunstable)
  describe "works with Bacon.never()", ->
    expectPropertyEvents(
      -> Bacon.constant(1).concat(Bacon.never())
      [1])
  describe "works with Bacon.once()", ->
    expectPropertyEvents(
      -> once(2).toProperty().concat(once(1))
      [2, 1])
  describe "works with constants", ->
    expectPropertyEvents(
      -> Bacon.constant(2).concat(Bacon.constant(3))
      [2, 3], unstable)
  describe "works with Bacon.once() and async source", ->
    expectPropertyEvents(
      -> once(1).toProperty().concat(series(1, [2, 3]))
      [1, 2, 3])
  describe "works with fromArray()", ->
    expectPropertyEvents(
      -> Bacon.constant(1).concat(fromArray([2, 3]))
      [1, 2, 3], unstable)

describe "Bacon.concatAll", ->
  describe "Concats streams and properties into a single stream", ->
    expectStreamEvents(
      ->
        Bacon.concatAll(
          Bacon.constant(1),
          once(2),
          sequentially(1, [3,4])
        )
      [1, 2, 3, 4])
  describe "Supports single array as well as multiple arguments", ->
    expectStreamEvents(
      ->
        Bacon.concatAll([
          Bacon.constant(1),
          once(2),
          sequentially(1, [3,4])
        ])
      [1, 2, 3, 4])
  describe "works with zero inputs", ->
    expectStreamEvents((-> Bacon.concatAll([])), [])
describe "EventStream.concat", ->
  describe "provides values from streams in given order and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(2, [1, error(), 2, 3])
        right = series(1, [4, 5, 6])
        left.concat(right)
      [1, error(), 2, 3, 4, 5, 6], semiunstable)
  describe "respects subscriber return value when providing events from left stream", ->
    expectStreamEvents(
      ->
        left = take(3, repeat(3, [1, 3]))
        right = take(3, repeat(2, [1]))
        left.concat(right).takeWhile(lessThan(2))
      [1])
  describe "respects subscriber return value when providing events from right stream", ->
    expectStreamEvents(
      ->
        left = series(3, [1, 2])
        right = series(2, [2, 4, 6])
        left.concat(right).takeWhile(lessThan(4))
      [1, 2, 2])
  describe "works with Bacon.never()", ->
    expectStreamEvents(
      -> Bacon.never().concat(Bacon.never())
      [])
  describe "works with Bacon.once()", ->
    expectStreamEvents(
      -> once(2).concat(once(1))
      [2, 1])
  describe "works with Bacon.constant()", ->
    expectStreamEvents(
      -> once(2).concat(Bacon.constant(1))
      [2, 1])
  describe "works with Bacon.once() and Bacon.never()", ->
    expectStreamEvents(
      -> once(1).concat(Bacon.never())
      [1])
  describe "works with Bacon.never() and Bacon.once()", ->
    expectStreamEvents(
      -> Bacon.never().concat(once(1))
      [1])
  describe "works with Bacon.once() and async source", ->
    expectStreamEvents(
      -> once(1).concat(series(1, [2, 3]))
      [1, 2, 3])
  describe "works with Bacon.once() and fromArray()", ->
    expectStreamEvents(
      -> once(1).concat(fromArray([2, 3]))
      [1, 2, 3], semiunstable)
  it "toString", ->
    expect(Bacon.never().concat(Bacon.never()).toString()).to.equal("Bacon.never().concat(Bacon.never())")
