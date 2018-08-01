import { EventStream } from "./observable";
import { Desc } from "./describe";
import { symbol } from "./symbol";
import { EventSink } from "./types";
import { End, Error, Next } from "./event";

/**
 * Creates an EventStream from an
 [ES Observable](https://github.com/tc39/proposal-observable). Input can be any
 ES Observable implementation including RxJS and Kefir.
 */
export default function fromESObservable<V>(_observable): EventStream<V> {
  var observable;
  if (_observable[symbol("observable")]) {
    observable = _observable[symbol("observable")]();
  } else {
    observable = _observable;
  }

  var desc = new Desc("Bacon", "fromESObservable", [observable]);
  return new EventStream(desc, function(sink: EventSink<V>) {
    var cancel = observable.subscribe({
      error: function(x) {
        sink(new Error(x));
        sink(new End());
      },
      next: function(value) { sink(new Next(value)); },
      complete: function() {
        sink(new End());
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