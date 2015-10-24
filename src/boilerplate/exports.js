if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() { return Bacon; });
  if (typeof this !== "undefined" && this !== null) {
    this.Bacon = Bacon;
  }
} else if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
  module.exports = Bacon; // for Bacon = require 'baconjs'
  Bacon.Bacon = Bacon; // for {Bacon} = require 'baconjs'
} else {
  this.Bacon = Bacon; // otherwise for execution context
}
