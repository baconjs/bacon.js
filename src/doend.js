// build-dependencies: observable

Bacon.Observable.prototype.doEnd = function() {
  var f = makeFunctionArgs(arguments);
  return withDesc(new Bacon.Desc(this, "doEnd", [f]), this.withHandler(function(event) {
    if (event.isEnd()) { f(); }
    return this.push(event);
  }));
};
