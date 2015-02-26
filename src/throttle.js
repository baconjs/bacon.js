// build-dependencies: buffer, scheduled, map

Bacon.EventStream.prototype.throttle = function (delay) {
  return withDescription(this, "throttle", delay, this.bufferWithTime(delay).map((values) => values[values.length - 1]));
};

Bacon.Property.prototype.throttle = function (delay) {
  return this.delayChanges("throttle", delay, (changes) => changes.throttle(delay));
};
