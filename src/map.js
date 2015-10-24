// build-dependencies: observable
// build-dependencies: functionconstruction

Bacon.Observable.prototype.map = function(p, ...args) {
  return convertArgsToFunction(this, p, args, function(f) {
    return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
      return this.push(event.fmap(f));
    }));
  });
};
