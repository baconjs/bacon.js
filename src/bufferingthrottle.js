// build-dependencies: filter, property, once
// build-dependencies: concat
// build-dependencies: flatmapconcat, later

Bacon.Observable.prototype.bufferingThrottle = function(minimumInterval) {
  var desc = new Bacon.Desc(this, "bufferingThrottle", [minimumInterval]);
  return withDesc(desc, this.flatMapConcat((x) => {
    return Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false));
  }));
};

Bacon.Property.prototype.bufferingThrottle = function() {
  return Bacon.Observable.prototype.bufferingThrottle.apply(this, arguments).toProperty();
};
