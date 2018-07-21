import { Desc } from "./describe";
import { default as Observable } from "./observable";
import { more } from "./reply";
import { Event, hasValue } from "./event"
import { EventSink } from "./types";
import { Predicate, PredicateOrProperty, withPredicate } from "./predicate";

export function skipWhile<V>(src: Observable<V>, f: PredicateOrProperty<V>) {
  return withPredicate(src, f, skipWhileT, new Desc(src, "skipWhile", [f]))
}

export function skipWhileT<V>(f: Predicate<V>) {
  var started = false;
  return function(event: Event<V>, sink: EventSink<V>) {
    if (started || !hasValue(event) || !f(event.value)) {
      if (event.hasValue) {
        started = true;
      }
      return sink(event);
    } else {
      return more;
    }
  }
}

export default skipWhile