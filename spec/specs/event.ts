import * as Bacon from "../..";
import { expect } from "chai";

describe("Bacon.Event", () =>
  describe("String presentations", () => {
    describe("Initial(1).toString", () =>
      it("is 1", () => expect(new Bacon.Initial(1).toString()).to.equal("1"))
    );
    describe("Next({a:1i}).toString", () =>
      it("is {a:1}", () => expect(new Bacon.Next({a:1}).toString()).to.equal("{a:1}"))
    );
    describe("Error({a:1}).toString", () =>
      it("is <error> {a:1}", () => expect(new Bacon.Error({a:1}).toString()).to.equal("<error> {a:1}"))
    );
    describe("End.toString", () =>
      it("is <end>", () => expect(new Bacon.End().toString()).to.equal("<end>"))
    );
    describe("inspect", () =>
      it("is the same as toString", () => expect(new Bacon.Initial(1).inspect()).to.equal("1"))
    );
  })
);
