import { makeObservable } from "./flatmap_"
import { Observable, Property } from "./observable";
import { Desc } from "./describe";
import { Function2 } from "./types";

/** @hidden */
export function flatScan<In, Out>(src: Observable<In>, seed: any | Function2<Out, In, Observable<Out> | Out>, f?: Function2<Out, In, Observable<Out> | Out>): Property<Out> {
  let current: Out;
  let isSeeded = false;

  if (typeof seed === "function") {
    return src.flatMapConcat(function (next: In) {
      return (isSeeded ? makeObservable(seed(current, next)) : makeObservable(next))
      .doAction(function (updated) {
        isSeeded = true;
        return current = updated;
      });
    }).toProperty();
  }

  current = seed;
  return src.flatMapConcat((next: In) =>
      // @ts-ignore: TS2722 Cannot invoke an object which is possibly 'undefined'. Cause it's optional!
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty().startWith(seed).withDesc(new Desc(src, "flatScan", [seed, f]))
}
