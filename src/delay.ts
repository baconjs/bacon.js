import { Desc } from "./describe";
import Observable, { EventStream  } from "./observable";
import later from "./later";

/** @hidden */
export default function delay<V>(src: Observable<V>, delay: number): Observable<V> {
  return src.transformChanges(new Desc(src, "delay", [delay]), function(changes: EventStream<V>) {
    return changes.flatMap(function(value) {
      return later(delay, value);
    })
  })
}