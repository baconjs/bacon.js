_ = require "lodash"

repeatString = (string, n) ->
  (string for num in [1..n]).join("")

anchorName = (str) ->
  str.toLowerCase().replace(/[^\w ]/g, "").replace /(.)/g, (c) ->
    if (c == " ")
      "-"
    else
      c

functionAnchorName = (signature) ->
  m = signature.match(/^(new )?([\$\w]+)\.(\w+)/)
  if m?
    (if m[1]? then "new-" else "") + (m[2] + "-" +m[3]).toLowerCase()

functionAnchor = (signature) ->
  anchorName = functionAnchorName (signature)
  '<a name="' + anchorName.toLowerCase() + '"></a>'

checkDuplicateAnchors = (anchors) ->
  _.each anchors, (anchor) ->
    f = _.filter anchors, (a) -> a == anchor
    if (f.length > 1)
      console.error("Duplicate anchor name: " + anchor)

checkLinks = (elements, anchors) ->
  textElements = _.filter elements, (element) ->
    element.type == "text" || element.type == "fn"

  _.each textElements, (element) ->
    ms = element.content.match(/\(#[a-z\-]+\)/g)
    if ms?
      ms = _.map ms, (m) -> m[2..m.length-2]
      diff = _.difference ms, anchors
      if diff.length > 0
        console.error("Undefined anchors: " + diff.join(", "))

strEndsWith = (name, suffix) ->
  name[-suffix.length..] == suffix

findFunctionAnchor = (text, anchors) ->
  fnAnchor = functionAnchorName(text)
  if fnAnchor? && _.contains anchors, fnAnchor
    fnAnchor

findAnchorByNeedle = (text, anchors) ->
  anchorNeedle = text.toLowerCase().replace(".", "-").replace(/[^a-z\-]/g, "")

  if _.contains anchors, anchorNeedle
    anchorNeedle
  else if _.contains ["subscribe", "f"], anchorNeedle
    undefined
  else
    possibleAnchors = _.filter anchors, (anchor) ->
      strEndsWith anchor, "-" + anchorNeedle

    if possibleAnchors.length == 1
      possibleAnchors[0]
    else if possibleAnchors.length > 1
      console.warn "Multiple matches:", text, possibleAnchors
      possibleAnchors[0]
    else
      undefined

findAnchor = (text, anchors) ->
  findFunctionAnchor(text, anchors) || findAnchorByNeedle(text, anchors)

linkifyCodeblocks = (elements, anchors) ->
  _.map elements, (element) ->
    if element.type != "text" && element.type != "fn"
      element
    else
      newContent = element.content.replace /(^|[^`\[])`([a-zA-Z\.\(\)]+?)`([^`\]]|$)/g  , (all, before, code, after) ->
        anchor = findAnchor code, anchors
        if anchor?
          before + '[`' + code + '`](#' + anchor + ')' + after
        else
          all

      _.extend {}, element,
        content: newContent

preprocess = (elements) ->
  anchors = _.compact _.map elements, (element) -> element.anchorName

  # Few checks
  checkDuplicateAnchors anchors
  checkLinks elements, anchors

  # Automatic `foo.bar` -> [`foo.bar`](#foo-bar)
  elements = linkifyCodeblocks elements, anchors

  elements

module.exports  =
  repeatString: repeatString
  anchorName: anchorName
  functionAnchorName: functionAnchorName
  functionAnchor: functionAnchor
  preprocess: preprocess
