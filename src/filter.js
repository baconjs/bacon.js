// build-dependencies: observable, property, eventstream, helpers
// build-dependencies: functionconstruction

Bacon.Observable.prototype.filter = function(f, ...args) {
  assertObservableIsProperty(f);
  return convertArgsToFunction(this, f, args, function(f) {
    return withDesc(new Bacon.Desc(this, "filter", [f]), this.withHandler(function(event) {
      if (event.filter(f)) {
        return this.push(event);
      } else {
        return Bacon.more;
      }
    }));
  });
};
