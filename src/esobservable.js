// build-dependencies: core

function ESObservable(observable) {
  this.observable = observable;
}

ESObservable.prototype.subscribe = function(observerOrOnNext, onError, onComplete) {
  const observer = typeof observerOrOnNext === 'function'
      ? { next: observerOrOnNext, error: onError, complete: onComplete }
      : observerOrOnNext
  const subscription = {
    closed: false,
    unsubscribe: function() {
      subscription.closed = true;
      cancel();
    }
  };

  const cancel = this.observable.subscribe(function(event) {
    if (event.isError()) {
      if (observer.error) observer.error(event.error);
      subscription.unsubscribe();
    } else if (event.isEnd()) {
      subscription.closed = true;
      if (observer.complete) observer.complete();
    } else if (observer.next) {
      observer.next(event.value());
    }
  });
  return subscription;
};

ESObservable.prototype[symbol('observable')] = function() {
  return this;
};

Bacon.Observable.prototype[symbol('observable')] = function() {
  return new ESObservable(this);
};
