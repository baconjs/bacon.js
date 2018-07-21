import { Property } from "./observable";
import _ from "./_";
import { mapT } from "./map";
import { Desc } from "./describe";
import Observable from "./observable";
import withLatestFrom from "./withlatestfrom";
import { composeT, Transformer } from "./transform";

export type Predicate<V> = (V) => boolean
export type PredicateOrBoolean<V> = Predicate<V> | boolean
export type PredicateOrProperty<V> = Predicate<V> | boolean | Property<boolean>

export function toPredicate<V>(f: PredicateOrBoolean<V>): Predicate<V> {
  if (typeof f == "boolean") {
    return _.always(f)
  } else if (typeof f != "function") {
    throw new Error("Not a function: " + f)
  } else {
    return f
  }
}

interface Predicate2Transformer<V> {
  (p: Predicate<V>): Transformer<V, V>
}
export function withPredicate<V>(src: Observable<V>, f: PredicateOrProperty<V>, predicateTransformer: Predicate2Transformer<V>, desc: Desc): Observable<V> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (p, v) => [p, v])
      .transform(composeT(predicateTransformer(([v, p]) => p), mapT(([v, p]) => v)), desc)
  }
  return src.transform(predicateTransformer(toPredicate(f)), desc)
}