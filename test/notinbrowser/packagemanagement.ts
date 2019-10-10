import { expect } from "chai";
import * as fs from "fs";

describe("Package management", function() {
  if (typeof window !== 'undefined') { return; }

  const verifyJson = (fn: string) =>
    JSON.parse(fs.readFileSync(fn, "utf-8"));
  it("NPM", () =>
      verifyJson("package.json"));
  it("Component", () =>
      verifyJson("component.json"));
  it("Bower", () => {
    verifyJson("bower.json");
  });
  describe("distribution files", function() {
    describe("dist/Bacon.js", function() {
        it("contains javascript", function() {
            checkDistFile("dist/Bacon.js")
        })
    })
    describe("dist/Bacon.min.js", function() {
      it("contains javascript", function() {
          checkDistFile("dist/Bacon.min.js")
      })
    })
  })
});

function checkDistFile(filename: string) {
  let contents = fs.readFileSync(filename, "utf-8");
  expect(contents.length).to.be.greaterThan(100);
}