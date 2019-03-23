import * as Bacon from "../..";
import { expect } from "chai";
import { expectStreamEvents, take } from "./util/SpecHelper";

describe("Bacon.fromPoll", function() {
  describe("repeatedly polls given function for values", () =>
    expectStreamEvents(
      () => take(2, Bacon.fromPoll(1, (() => "lol"))),
      ["lol", "lol"])
  );
  describe("supports returning Event objects", () =>
    expectStreamEvents(
      () => take(2, Bacon.fromPoll(1, (() => new Bacon.Next(1)))),
      [1, 1])
  );
  describe("supports returning array of Event objects", () =>
    expectStreamEvents(
      () => take(2, Bacon.fromPoll(1, (() => [new Bacon.Next(1)]))),
      [1, 1])
  );
  return it("toString", () => expect(Bacon.fromPoll(1, (function() {})).toString()).to.equal("Bacon.fromPoll(1,function)"));
});
