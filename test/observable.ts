import * as Bacon from "..";
import { expect } from "chai";

describe("Observable", () => {
  describe("Observable::onEnd", () =>
    it("is called on stream end", () => {
      const s = new Bacon.Bus();
      let ended = false;
      s.onEnd(() => {
        ended = true;
        return undefined;
      });
      s.push("LOL");
      expect(ended).to.deep.equal(false);
      s.end();
      expect(ended).to.deep.equal(true);
    })
  );

  describe("onValue and friends", () => {
    it("Accept any return type", () => {
      Bacon.once(1).onValue(n => {})
      Bacon.once(1).onValue(n => { return "hello!" })
    })

    it("Stop subscription when noMore is returned", () => {
      let b = new Bacon.Bus<number>()
      let results = [] as number[]
      b.onValue(x => { results.push(x); return Bacon.noMore})
      b.push(1)
      b.push(2)
      expect(results).to.deep.equal([1])
    })
  })

  describe("Meta-info", function () {
    const obs = Bacon.once(1).map(function () { });
    describe("Observable::desc", () =>
      it("returns structured description", () => {
        expect(obs.desc.method).to.equal("map")
      })
    );

    describe("Observable::deps", () =>
      it("returns dependencies", function () {
        expect(obs.deps().length).to.equal(1);
        expect(obs.deps()[0].toString()).to.equal("Bacon.once(1)");
      })
    );

    describe("Observable::internalDeps", () =>
      it("returns \"real\" deps", function () {
        expect(obs.deps().length).to.equal(1);
        expect(obs.deps()[0].toString()).to.equal("Bacon.once(1)");
      })
    );
  });
})