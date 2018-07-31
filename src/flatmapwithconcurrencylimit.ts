import './flatmap_'
import flatMap_, { handleEventValueWith, SpawnerOrObservable } from "./flatmap_"
import Observable from "./observable";
import { Desc } from "./describe";

/** @hidden */
export default function flatMapWithConcurrencyLimit<V, V2>(src: Observable<V>, limit: number, f: SpawnerOrObservable<V, V2>): Observable<V2> {
  return flatMap_(
    handleEventValueWith(f),
    src,
    {
      desc: new Desc(src, "flatMapWithConcurrencyLimit", [limit, f]),
      limit
    }
  )
}