if define? and define.amd?
  define [], -> Bacon
  @Bacon = Bacon
else if module? and module.exports?
  module.exports = Bacon # for Bacon = require 'baconjs'
  Bacon.Bacon = Bacon # for {Bacon} = require 'baconjs'
else
  @Bacon = Bacon # otherwise for execution context
