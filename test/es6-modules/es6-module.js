import * as Bacon from '../../dist/Bacon.mjs';
import { expect } from "chai";
const pkg = require('../../package.json');

describe("ES6 module", function() {
  it("Passes smoke test", () => {
    const b = new Bacon.Bus()
    const results = []
    b.map(x => x*2).forEach(v => results.push(v))
    b.push(1)
    b.push(2)
    expect(results).to.deep.equal([2,4])
  })
  it("fromPromise", () => {
    Bacon.fromPromise(new Promise(() => {}))
  })
  it("firstToPromise", () => {
    Bacon.once(1).firstToPromise()
  })
  it("has the version number", () => {
    expect(Bacon.version).to.equal(pkg.version);
  })
});