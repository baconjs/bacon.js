if define? and define.amd?
  define [], -> Bacon
  @Bacon = Bacon

if module? and module.exports?
  module.exports = Bacon # for Bacon = require 'baconjs'
  Bacon.Bacon = Bacon # for {Bacon} = require 'baconjs'

@Bacon = Bacon # otherwise for execution context
