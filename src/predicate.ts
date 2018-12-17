import { Property } from "./observable";
import _ from "./_";
import { mapT } from "./map";
import { Desc } from "./describe";
import Observable from "./observable";
import withLatestFrom from "./withlatestfrom";
import { composeT, Transformer } from "./transform";

export type Predicate<V> = (V) => boolean
/** @hidden */
export type PredicateOrBoolean<V> = Predicate<V> | boolean
export type PredicateOrProperty<V> = Predicate<V> | boolean | Property<boolean>

/** @hidden */
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

type BoolTuple<T> = [T, boolean]

/** @hidden */
export function withPredicate<V>(src: Observable<V>, f: PredicateOrProperty<V>, predicateTransformer: Predicate2Transformer<V>, desc: Desc): Observable<V> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (p, v) => <BoolTuple<V>>[p, v])
      .transform(composeT(<any>predicateTransformer((tuple: BoolTuple<V>) => tuple[1]), mapT((tuple: BoolTuple<V>) => tuple[0])), desc)
      // the `any` type above is needed because the type argument for Predicate2Transformer is fixed. We'd need higher-kinded types to be able to express this properly, I think.
  }
  return src.transform(predicateTransformer(toPredicate(f)), desc)
}
