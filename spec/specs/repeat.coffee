require("../../src/concat")
require("../../src/filter")
require("../../src/flatmap")
require("../../src/repeat")
require("../../src/take")
Bacon = require("../../src/core").default
expect = require("chai").expect

{
  expectStreamEvents,
  later,
  unstable,
  semiunstable,
  take,
  endlessly,
  repeatedly
} = require("../SpecHelper")

describe "Bacon.repeat", ->
  describe "Polls new streams from generator function until empty result", ->
    expectStreamEvents(
      ->
        count = 0
        Bacon.repeat ->
          count++
          if count <= 3
            later(1, count)
      [1,2,3])
  describe "Works with synchronous streams", ->
    expectStreamEvents(
      ->
        count = 0
        Bacon.repeat ->
          count++
          if count <= 3
            Bacon.once(count)
      [1,2,3], unstable)
  describe "Provides generator function with index", ->
    expectStreamEvents(
      ->
        take(3, Bacon.repeat((x) -> later(0, x)))
      [0,1,2])
  describe "Works with endless asynchronous generators", ->
    expectStreamEvents(
      ->
        take(3, Bacon.repeat(-> later(0, 1)))
      [1,1,1])
  describe "No stackoverflow", ->
    expectStreamEvents(
      ->
        take(3000, Bacon.repeat(-> Bacon.once(1))).filter(false)
      [])
  describe "Works with endless asynchronous streams", ->
    expectStreamEvents(
      ->
        take(3, Bacon.repeat(-> repeatedly(1, [1])))
      [1,1,1])
  describe "Works with endless synchronous generators", ->
    expectStreamEvents(
      ->
        take(3, Bacon.repeat(-> Bacon.once(1)))
      [1,1,1], unstable)
