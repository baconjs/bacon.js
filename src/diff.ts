import { filterT } from "./filter";
import { Desc } from "./describe";
import Observable, { Property } from "./observable";
import { composeT, transformP } from "./transform";
import { mapT } from "./map";
import scan from "./scan";

export type Differ<V, V2> = (a: V, b:V) => V2

export function diff<V, V2>(src: Observable<V>, start: V, f: Differ<V, V2>): Property<V2> {
  return transformP(
      scan(src, [start], (prevTuple: V[], next) => [next, f(prevTuple[0], next)]),
      composeT(
        filterT( tuple => tuple.length === 2 ),
        mapT(tuple => tuple[1])
      ),
      new Desc(src, "diff", [start, f])
    )
}
