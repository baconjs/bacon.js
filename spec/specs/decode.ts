import * as Bacon from "../..";
import { expect } from "chai";

import { expectPropertyEvents, series } from "./util/SpecHelper";

describe("Property.decode", function() {
  describe("switches between source Properties based on property value", () =>
    expectPropertyEvents(
      function() {
        const a = Bacon.constant("a");
        const b = Bacon.constant("b");
        const c = Bacon.constant("c");
        return series(1, [1,2,3]).toProperty().decode({1: a, 2: b, 3: c});
      },
      ["a", "b", "c"])
  );
  it("toString", () => expect(Bacon.constant(1).decode({1: "lol"}).toString()).to.equal("Bacon.constant(1).decode({1:lol})"));
});

describe("EventStream.decode", () =>
  describe("switches between source Properties based on property value", () =>
    expectPropertyEvents(
      function() {
        const a = Bacon.constant("a");
        const b = Bacon.constant("b");
        const c = Bacon.constant("c");
        return series(1, [1,2,3]).decode({1: a, 2: b, 3: c});
      },
      ["a", "b", "c"])
  )
);
