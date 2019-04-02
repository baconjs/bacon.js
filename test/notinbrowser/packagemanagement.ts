describe("Package management", function() {
  if (typeof window !== 'undefined') { return; }

  const fs = require("fs");
  const verifyJson = (fn: string) =>
    JSON.parse(fs.readFileSync(fn, "utf-8"));
  it("NPM", () =>
      verifyJson("package.json"));
  it("Component", () =>
      verifyJson("component.json"));
  it("Bower", () => {
    verifyJson("bower.json");
  });
});
