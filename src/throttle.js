// build-dependencies: buffer, map, delaychanges

Bacon.Observable.prototype.throttle = function (delay) {
  return this.delayChanges(new Bacon.Desc(this, "throttle", [delay]), (changes) => changes.bufferWithTime(delay).map((values) => values[values.length - 1]));
};
