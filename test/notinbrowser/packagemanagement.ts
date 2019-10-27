import { expect } from "chai";
import * as fs from "fs";

describe("Package management", function() {
  it("NPM", () =>
      verifyJson("package.json"));
  it("Component", () =>
      verifyJson("component.json"));
  it("Bower", () => {
    verifyJson("bower.json");
  });
  describe("distribution files", function() {
    verifyDistFile("dist/Bacon.js")
    verifyDistFile("dist/Bacon.min.js")
    verifyDistFile("dist/Bacon.mjs")
    verifyDistFile("dist/Bacon.min.mjs")
  })
});

function verifyJson(fn: string) {
  JSON.parse(fs.readFileSync(fn, "utf-8"));
}

function verifyDistFile(filename: string) {
  describe(filename, function() {
    it("contains javascript", function() {
      let contents = fs.readFileSync(filename, "utf-8");
      expect(contents.length).to.be.greaterThan(100);    
    })
  })
}