// build-dependencies: core

Bacon.Observable.prototype.first = function () {
  // It's important not to use fat arrow here!
  return withDescription(this, "first", this.withHandler(function (event) {
    if (!event.isEnd()) {
      this.push(event);
    }
    this.push(endEvent());
    return Bacon.noMore;
  }));
};
