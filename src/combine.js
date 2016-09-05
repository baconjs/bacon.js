// build-dependencies: core, source, map
// build-dependencies: functionconstruction, argumentstoobservables
// build-dependencies: when

Bacon.combineAsArray = function() {
  var streams = argumentsToObservables(arguments)
  if (streams.length) {
    var sources = [];
    for (var i = 0; i < streams.length; i++) {
      let stream = isObservable(streams[i])
        ? streams[i]
        : Bacon.constant(streams[i])
      sources.push(new Source(stream, true));
    }
    return withDesc(new Bacon.Desc(Bacon, "combineAsArray", streams), 
                    Bacon.when(sources, (function(...xs) { return xs; })).toProperty());
  } else {
    return Bacon.constant([]);
  }
};

Bacon.onValues = function(...streams) {
  return Bacon.combineAsArray(streams.slice(0, streams.length - 1)).onValues(streams[streams.length - 1]);
};

Bacon.combineWith = function() {
  var [streams, f] = argumentsToObservablesAndFunction(arguments);
  var desc = new Bacon.Desc(Bacon, "combineWith", [f, ...streams]);
  return withDesc(desc, Bacon.combineAsArray(streams).map(function(values) { return f(...values); }));
};

Bacon.Observable.prototype.combine = function(other, f) {
  var combinator = toCombinator(f);
  var desc = new Bacon.Desc(this, "combine", [other, f]);
  return withDesc(desc, Bacon.combineAsArray(this, other).map(function(values) { return combinator(values[0], values[1]); }));
};
