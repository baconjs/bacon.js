import Observable from "./observable";
import "./sample";
import "./filter";
import { endEvent } from "./event";
import { noMore } from "./reply";
import { Desc } from "./describe";
import { Transformer } from "./transform";
import { Predicate, PredicateOrProperty, withPredicate } from "./predicate";

/** @hidden */
export function takeWhile<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V> {
  return withPredicate(src, f, takeWhileT, new Desc(src, "takeWhile", [f]))
}

function takeWhileT<V>(f: Predicate<V>): Transformer<V, V> {
  return (event, sink) => {
    if (event.filter(f)) {
      return sink(event);
    } else {
      sink(endEvent());
      return noMore;
    }
  }
}