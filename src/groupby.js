// build-dependencies: filter, map, once, concat, observable

Bacon.Observable.prototype.groupBy = function(keyF, limitF = Bacon._.id) {
  var streams = {};
  var src = this;
  return src
    .filter(function(x) { return !streams[keyF(x)]; })
    .map(function(x) {
      var key = keyF(x);
      var similar = src.filter(function(x) { return keyF(x) === key; });
      var data = Bacon.once(x).concat(similar);
      var limited = limitF(data, x).withHandler(function(event) {
        this.push(event);
        if (event.isEnd()) {
          return delete streams[key];
        }
      });
      streams[key] = limited;
      return limited;
    });
};
