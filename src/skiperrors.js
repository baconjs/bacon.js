// build-dependencies: observable

Bacon.Observable.prototype.skipErrors = function() {
  return withDesc(new Bacon.Desc(this, "skipErrors", []), this.withHandler(function(event) {
    if (event.isError()) {
      return Bacon.more;
    } else {
      return this.push(event);
    }
  }));
};
