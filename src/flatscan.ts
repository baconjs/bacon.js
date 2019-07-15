import { makeObservable } from "./flatmap_"
import { Observable, Property } from "./observable";
import { Desc } from "./describe";
import { Function2 } from "./types";

/** @hidden */
export function flatScanSeedless<V>(src: Observable<V>, f: Function2<V, V, Observable<V> | V>): Property<V> {
  let current: V;
  let isSeeded = false;

  return src.flatMapConcat(function (next: V) {
    return (isSeeded ? makeObservable(f(current, next)) : makeObservable(next))
      .doAction(function (updated: V) {
        isSeeded = true;
        current = updated;
      });
  }).toProperty().withDesc(new Desc(src, "flatScan", [f]));
}

/** @hidden */
export function flatScan<In, Out>(src: Observable<In>, seed: Out, f: Function2<Out, In, Observable<Out> | Out>): Property<Out> {
  let current = seed;
  return src.flatMapConcat((next: In) =>
      // @ts-ignore: TS2722 Cannot invoke an object which is possibly 'undefined'. Cause it's optional!
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty().startWith(seed).withDesc(new Desc(src, "flatScan", [seed, f]))
}