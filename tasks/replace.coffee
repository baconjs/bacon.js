module.exports = asserts:
  dest: "dist/Bacon.noAssert.coffee"
  src: ["dist/Bacon.coffee"]
  replacements: [
    from: /assert.*/g
    to: ""
  ]