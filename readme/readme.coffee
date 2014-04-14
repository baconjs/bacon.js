common = require "./common.coffee"
_ = require "lodash"

renderToc = (elements) ->
  toc = ""
  _.each elements, (element) ->
    switch element.type
      when "toc"
        toc += '- [Table of contents](#table-of-contents)\n'
      when "section"
        toc += '- [' + element.name + '](#' + common.anchorName(element.name) + ')' + '\n'
      when "subsection"
        toc += '    - [' + element.name + '](#' + common.anchorName(element.name) + ')' + '\n'
      when "subsubsection"
        toc += '        - [' + element.name + '](#' + common.anchorName(element.name) + ')' + '\n'

  _.flatten _.map elements, (element) ->
    switch element.type
      when "toc"
        title =
          type: "section"
          name: "Table of contents"
        content =
          type: "text"
          content: toc
        [title, content]
      else
        [element]

renderSignature = (parsedSignature) ->
  n = if parsedSignature.n then "new " else ""
  o = parsedSignature.namespace
  m = parsedSignature.method

  name = (n + o + "." + m)

  params = parsedSignature.params?.filter (p) ->
    p.name != "@"
  params = params?.map (p, i) ->
    r = p.name
    if i != 0
      r = ", " + r

    if p.splat
      r = r + "..."

    if p.optional
      r = "[" + r + "]"
      if i != 0
        r = " " + r

    r

  if params
    name + "(" + params.join("") + ")"
  else
    name

renderElement = (element) ->
  switch element.type
    when "text"
      element.content
    when "section"
      element.name + "\n" + common.repeatString "=", element.name.length
    when "subsection"
      element.name + "\n" + common.repeatString "-", element.name.length
    when "subsubsection"
      '### ' + element.name
    when "fn"
      anchor = '<a name="' + element.anchorName + '"></a>'
      anchor + "\n[`" + renderSignature(element.parsedSignature) + '`](#' + element.anchorName + ' "' +  element.signature + '") ' + element.content
    when "logo"
      """<img src="https://raw.github.com/baconjs/bacon.js/master/logo.png" align="right" width="300px" />"""
    when "marble"
      undefined # filter marbles from README.md
    else
      throw new Error("Unknown token type: " + element.type)

render = (doc) ->
  elements = _.cloneDeep doc.elements

  elements = common.preprocess elements

  elements = renderToc elements

  _.chain(elements)
    .map(renderElement)
    .compact()
    .join("\n\n")
    .value() + "\n"

module.exports = render
