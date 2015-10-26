// build-dependencies: observable, describe

Bacon.Observable.prototype.mapError = function() {
  const f = makeFunctionArgs(arguments);
  return withDesc(new Bacon.Desc(this, "mapError", [f]), this.withHandler(function(event) {
    if (event.isError()) {
      return this.push(nextEvent(f(event.error)));
    } else {
      return this.push(event);
    }
  }));
};
