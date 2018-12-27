import { makeObservable } from "./flatmap_"
import { Observable, Property } from "./observable";
import { Desc } from "./describe";
import { Function2 } from "./types";

/** @hidden */
export function flatScan<In, Out>(src: Observable<In>, seed: Out, f: Function2<Out, In, Observable<Out>>): Property<Out> {
  let current = seed
  return src.flatMapConcat((next: In) =>
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty().startWith(seed).withDesc(new Desc(src, "flatScan", [seed, f]))
}
