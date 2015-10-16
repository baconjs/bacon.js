// build-dependencies: observable

Bacon.Observable.prototype.doError = function() {
  var f = makeFunctionArgs(arguments);
  return withDesc(new Bacon.Desc(this, "doError", [f]), this.withHandler(function(event) {
    if (event.isError()) { f(event.error); }
    return this.push(event);
  }));
};
