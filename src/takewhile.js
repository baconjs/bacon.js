// build-dependencies: observable, filter, helpers

Bacon.Observable.prototype.takeWhile = function(f, ...args) {
  assertObservableIsProperty(f);
  return convertArgsToFunction(this, f, args, function(f) {
    return withDesc(new Bacon.Desc(this, "takeWhile", [f]), this.withHandler(function(event) {
      if (event.filter(f)) {
        return this.push(event);
      } else {
        this.push(endEvent());
        return Bacon.noMore;
      }
    }));
  });
};
