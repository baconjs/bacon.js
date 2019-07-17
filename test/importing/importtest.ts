import * as B from "../../types/bacon"

// This code is never run - it's only compiled to make sure that the generated types are alright.
// It seems that mocha/ts-node do not perform all the same checks on the imported code.

console.log("Bacon.js can be imported and has version", B.version)