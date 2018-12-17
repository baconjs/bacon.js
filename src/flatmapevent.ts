import { Desc } from "./describe";
import Observable from "./observable";
import { flatMap_, EventSpawner } from "./flatmap_"


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
