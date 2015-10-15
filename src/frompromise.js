// build-dependencies: frombinder
// build-dependencies: event
// build-dependencies: describe

function valueAndEnd(value) {
  return [value, endEvent()];
}

Bacon.fromPromise = function(promise, abort, _eventTransformer) {
  const eventTransformer = _eventTransformer || valueAndEnd;
  return withDesc(new Bacon.Desc(Bacon, "fromPromise", [promise]), Bacon.fromBinder(function(handler) {
    const bound = promise.then(handler, (e) => handler(new Error(e)));
    if (bound && typeof bound.done === "function") {
      bound.done();
    }

    if (abort) {
      return function() {
        if (typeof promise.abort === "function") {
          return promise.abort();
        }
      };
    } else {
      return function() {};
    }
  }, eventTransformer));
};
