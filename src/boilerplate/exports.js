if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return Bacon;
  });
  this.Bacon = Bacon;
} else if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
  module.exports = Bacon;
  Bacon.Bacon = Bacon;
} else {
  this.Bacon = Bacon;
}

// function wrapper
}).call(this);
