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

renderSignature = (signature) ->
  signature
    .replace(/@\s*:.*?,\s*/, "")
    .replace(/@\s*:.*?\)/, ")")
    .replace(/\s*:.*?([,\)])/, (_, c) -> c ? "")
    .replace(/\s*:.*$/, "")

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
      common.functionAnchor(element.signature) + "\n`" + renderSignature(element.signature) + "` " + element.content
    when "logo"
      """<img src="https://raw.github.com/baconjs/bacon.js/master/logo.png" align="right" width="300px" />"""
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
