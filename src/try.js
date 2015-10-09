// build-dependencies: core, once
Bacon.try = function(f) {
  return function(value) {
    try {
      return Bacon.once(f(value));
    } catch(e) {
      return new Bacon.Error(e);
    }
  }
};
