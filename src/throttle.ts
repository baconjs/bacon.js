import "./buffer";
import "./map";
import Observable from "./observable";
import { Desc } from "./describe";

/** @hidden */
export default function throttle<V>(src: Observable<V>, delay: number): Observable<V> {
  return src.transformChanges(new Desc(src, "throttle", [delay]), (changes) =>
    changes.bufferWithTime(delay).map((values) => values[values.length - 1])
  );
}