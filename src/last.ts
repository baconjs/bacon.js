import { Desc } from "./describe";
import { noMore } from "./reply";
import { endEvent, hasValue, isEnd, Value } from "./event";
import Observable from "./observable";

/** @hidden */
export default function last<V>(src: Observable<V>): Observable<V> {
  var lastEvent: Value<V>;
  return src.transform<V>(function (event, sink) {
    if (isEnd(event)) {
      if (lastEvent) {
        sink(lastEvent);
      }
      sink(endEvent());
      return noMore;
    } else if (hasValue(event)) {
      lastEvent = event;
    } else {
      sink(event)
    }
  }).withDesc(new Desc(src, "last", []));
}