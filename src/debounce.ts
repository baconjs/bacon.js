import { Desc } from "./describe";
import "./flatmaplatest";
import "./filter";
import "./concat";
import Observable from "./observable"
import later from "./later"
import once from "./once"

/** @hidden */
export function debounce<V>(src: Observable<V>, delay: number): Observable<V> {
  return src.delayChanges(new Desc(src, "debounce", [delay]), function(changes) {
    return changes.flatMapLatest(function(value) {
      return later(delay, value)
    })
  })
}

/** @hidden */
export function debounceImmediate<V>(src: Observable<V>, delay: number): Observable<V> {
  return src.delayChanges(new Desc(src, "debounceImmediate", [delay]), function(changes) {
    return changes.flatMapFirst(function(value) {
      return once(value).concat(later(delay, value).errors());
    })
  })
}

export default debounce