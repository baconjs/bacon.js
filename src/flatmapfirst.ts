import flatMap_, { handleEventValueWith, SpawnerOrObservable } from "./flatmap_"
import { Desc } from "./describe";
import Observable from "./observable";

/** @hidden */
export default function flatMapFirst<V, V2>(src: Observable<V>, f: SpawnerOrObservable<V, V2>): Observable<V2> {
  return flatMap_(
    handleEventValueWith(f),
    src,
    {
      firstOnly: true,
      desc: new Desc(src, "flatMapFirst", [f])
    }
  )
}