import { filterT } from "./filter";
import { Desc } from "./describe";
import Observable, { Property } from "./observable";
import { composeT, transformP } from "./transform";
import { mapT } from "./map";
import scan from "./scan";
import { Function2 } from "./types";

export type Differ<V, V2> = Function2<V, V, V2>
const nullMarker = {}

/** @hidden */
export function diff<V, V2>(src: Observable<V>, start: V, f: Differ<V, V2>): Property<V2> {
  type Accumulator = [V, V2 | typeof nullMarker]
  return transformP(
      scan(src, [start, nullMarker] as Accumulator, ((prevTuple: Accumulator, next: V) => [next, f(prevTuple[0], next)] as Accumulator)),
      composeT(
        filterT( tuple => tuple[1] !== nullMarker ),
        mapT(tuple => <any>tuple[1])
      ),
      new Desc(src, "diff", [start, f])
    )
}
