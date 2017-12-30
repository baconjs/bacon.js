// build-dependencies: observable

Bacon.Observable.prototype.doAction = function() {
  var f = makeFunctionArgs(arguments);
  return withDesc(new Bacon.Desc(this, "doAction", [f]), this.withHandler(function(event) {
    if (event.hasValue()) { f(event.value); }
    return this.push(event);
  }));
};
