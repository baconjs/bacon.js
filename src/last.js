// build-dependencies: core

Bacon.Observable.prototype.last = function () {
  var lastEvent;
  // It's important not to use fat arrow here!
  return withDescription(this, "last", this.withHandler(function (event) {
    if (event.isEnd()) {
      // Push last event or `undefined`
      this.push(lastEvent || nextEvent());
      this.push(endEvent());
      return Bacon.noMore;
    } else {
      lastEvent = event;
    }
  }));
};
