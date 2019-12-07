import "./filter";
import "./concat";
import Observable from "./observable";
import later from "./later";
import once from "./once";
import { Desc } from "./describe";

/** @hidden */
export default function bufferingThrottle<V>(src: Observable<V>, minimumInterval: number): Observable<V> {
  var desc = new Desc(src, "bufferingThrottle", [minimumInterval]);
  return src.transformChanges(desc, changes => changes.flatMapConcat((x) => {
    return once(x).concat(later(minimumInterval, x).errors());
  }))
}