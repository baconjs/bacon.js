_ = require "lodash"
assert = require "assert"
common = require "./common.coffee"

# Sections and sub(sub) sections are virtually the same
SECTION_SPEC = 
  params: ["name"]
  process: (element) ->
    element.anchorName = common.anchorName element.name
    element

# our doc DSL specification
DOC_SPEC =
  logo:
    params: []

  toc:
    params: []

  section: SECTION_SPEC
  subsection: SECTION_SPEC
  subsubsection: SECTION_SPEC

  text:
    params: ["content"]

  fn:
    params: ["signature", "content"]
    process: (element) ->
      element.anchorName = common.functionAnchorName element.signature
      element

  fnOverload:
    params: ["signature", "anchor", "content"]
    process: (element) ->
      element.type = "fn"
      element.anchorName = common.functionAnchorName(element.signature) + "-" + element.anchor
      element

# DSL helper class
class Doc
  constructor: ->
    @elements = []

  push: (element) ->
    @elements.push element

  dump: ->
    console.log @elements

_.each DOC_SPEC, (spec, name) ->
  Doc::[name] = () ->
    assert.equal arguments.length, spec.params.length,
      "There should be same amount of params as spec'd"

    element =
      type: name

    for index in [0...spec.params.length]
      element[spec.params[index]] = arguments[index]

    if spec.process?
      element = spec.process element

    @push element

module.exports = Doc

