import EventStream from "./eventstream";
import { Desc } from "./describe";
import Bacon from "./core";
import { symbol } from "./symbol";
import { EventSink } from "./types";

export default function fromESObservable<V>(_observable): EventStream<V> {
  var observable;
  if (_observable[symbol("observable")]) {
    observable = _observable[symbol("observable")]();
  } else {
    observable = _observable;
  }

  var desc = new Desc(Bacon, "fromESObservable", [observable]);
  return new EventStream(desc, function(sink: EventSink<V>) {
    var cancel = observable.subscribe({
      error: function(x) {
        sink(new Bacon.Error(x));
        sink(new Bacon.End());
      },
      next: function(value) { sink(new Bacon.Next(value)); },
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

Bacon.fromESObservable = fromESObservable
