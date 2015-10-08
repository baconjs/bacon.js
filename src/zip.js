// build-dependencies: _, core, argumentstoobservables
// build-dependencies: when

Bacon.zipAsArray = function(...args) {
  var streams = argumentsToObservables(args);
  return withDesc(
    new Bacon.Desc(Bacon, "zipAsArray", streams),
    Bacon.zipWith(streams, (...xs) => xs));
};

Bacon.zipWith = function(...args) {
  var observablesAndFunction = argumentsToObservablesAndFunction(args);
  var streams = observablesAndFunction[0];
  var f = observablesAndFunction[1];

  streams = _.map(((s) => s.toEventStream()), streams);
  return withDesc(
    new Bacon.Desc(Bacon, "zipWith", [f].concat(streams)),
    Bacon.when(streams, f));
};

Bacon.Observable.prototype.zip = function(other, f) {
  return withDesc(
    new Bacon.Desc(this, "zip", [other]),
    Bacon.zipWith([this, other], f || Array));
};
