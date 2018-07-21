import { Desc } from "./describe";
import flatMap_, { handleEventValueWith, SpawnerOrObservable } from "./flatmap_"
import Observable from "./observable";

export default function flatMapConcat<V, V2>(src: Observable<V>, f: SpawnerOrObservable<V, V2>): Observable<V2> {
  return flatMap_(
    handleEventValueWith(f),
    src,
    {
      desc: new Desc(src, "flatMapConcat", [f]),
      limit: 1
    }
  )
}
