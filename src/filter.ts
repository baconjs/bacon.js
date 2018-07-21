import { Desc } from "./describe";
import { more } from "./reply";
import Observable from "./observable";
import { Event } from "./event"
import { EventSink } from "./types"
import { Predicate, PredicateOrProperty, withPredicate } from "./predicate";

export function filter<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V> {
  return withPredicate(src, f, filterT, new Desc(src, "filter", [f]))
}

export function filterT<V>(f: Predicate<V>) {
  return (e:Event<V>, sink: EventSink<V>) => {
    if (e.filter(f)) {
      return sink(e);
    } else {
      return more;
    }
  }
}