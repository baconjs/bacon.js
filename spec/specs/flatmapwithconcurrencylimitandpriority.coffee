require("../../src/flatmapwithconcurrencylimitandpriority")
Bacon = require("../../src/core").default
expect = require("chai").expect

{
  expectStreamEvents,
  error,
  fromArray,
  series,
  semiunstable,
  t
} = require("../SpecHelper")

describe "EventStream.flatMapWithConcurrencyLimitAndPriority", ->
  describe "limits the number of concurrently active spawned streams by queuing", ->
    expectStreamEvents(
      -> series(1, [1, 3, 2]).flatMapWithConcurrencyLimitAndPriority(1, ((a, b) -> a - b), (value) ->
        series(t(2), [value, error(), value]))
      [1, error(), 1, 2, error(), 2, 3, error(), 3], semiunstable)
  describe "works with n=2", ->
    expectStreamEvents(
      -> series(1, [{p: 1}, {p: 2}, {p: 5}, {p: 4}, {p: 3}]).flatMapWithConcurrencyLimitAndPriority(2, ((a, b) -> a.p - b.p), (value) ->
        series(t(4), [value, value]))
      [{p: 1}, {p: 2}, {p: 1}, {p: 2}, {p: 3}, {p: 4}, {p: 3}, {p: 4}, {p: 5}, {p: 5}], semiunstable)

