// build-dependencies: core

Bacon.Observable.prototype.last = function () {
  var lastEvent;
  // It's important not to use fat arrow here!
  return withDescription(this, "last", this.withHandler(function (event) {
    if (event.isEnd()) {
      // Push last event or `undefined`
      if (lastEvent) {
        this.push(lastEvent);
      }
      this.push(endEvent());
      return Bacon.noMore;
    } else {
      lastEvent = event;
    }
  }));
};
