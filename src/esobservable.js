// build-dependencies: core

function ESObservable(observable) {
  this.observable = observable;
}

ESObservable.prototype.subscribe = function(observer) {
  var cancel = this.observable.subscribe(function(event) {
    if (event.isError()) {
      if (observer.error) observer.error(event.error);
      cancel();
    } else if (event.isEnd()) {
      if (observer.complete) observer.complete();
      cancel();
    } else if (observer.next) {
      observer.next(event.value());
    }
  });
  return cancel;
};

Bacon.Observable.prototype[symbol('observable')] = function() {
  return new ESObservable(this);
};
