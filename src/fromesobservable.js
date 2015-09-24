// build-dependencies: eventstream, event, helpers

Bacon.fromESObservable = function(_observable) {
  var observable;
  if (_observable[symbolObservable]) {
    observable = _observable[symbolObservable]();
  } else {
    observable = observable;
  }

  var desc = new Bacon.Desc(Bacon, "fromESObservable", [observable]);
  return new Bacon.EventStream(desc, function(sink) {
    var cancel = observable.subscribe({
      error: function() {
        sink(new Bacon.Error());
        sink(new Bacon.End());
      },
      next: function(value) { sink(new Bacon.Next(value, true)); },
      complete: function() {
        sink(new Bacon.End());
      }
    });

    // Support RxJS Observables
    if (cancel.unsubscribe) {
      return function() { cancel.unsubscribe(); };
    } else {
      return cancel;
    }
  });
};
