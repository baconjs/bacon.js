import Observable from "./observable";
import { symbol } from "./symbol";
import Event, { isError, hasValue } from "./event";

class ESObservable<V> {
  observable: Observable<V>
  constructor(observable: Observable<V>) {
    this.observable = observable;
  }  
  subscribe(observerOrOnNext: any, onError: any, onComplete: any) {
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
  
    const cancel = this.observable.subscribe(function(event: Event<V>) {
      if (hasValue(event) && observer.next) {
        observer.next(event.value);
      } else if (isError(event)) {
        if (observer.error) observer.error(event.error);
        subscription.unsubscribe();
      } else if (event.isEnd) {
        subscription.closed = true;
        if (observer.complete) observer.complete();
      }
    });
    return subscription;
  }
}

(<any>ESObservable.prototype)[symbol('observable')] = function() {
  return this;
};

(<any>Observable.prototype).toESObservable = function() {
  return new ESObservable(this);
};

(<any>Observable.prototype)[symbol('observable')] = (<any>Observable.prototype).toESObservable;
