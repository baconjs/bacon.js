import { Desc } from "./describe";
import Observable from "./observable";
import flatMap_ from "./flatmap_"
import { Event } from "./event";

export interface EventSpawner<V, V2> {
  (e: Event<V>): Observable<V2>
}

/** @hidden */
export default function flatMapEvent<V, V2>(src: Observable<V>, f: EventSpawner<V, V2>): Observable<V2> {
  return flatMap_(
    f,
    src,
    {
      mapError: true,
      desc: new Desc(src, "flatMapEvent", [f])
    }
  )
}