import { Desc } from "./describe";
import { noMore } from "./reply";
import { Event, endEvent, isEnd } from "./event";
import Observable from "./observable";

export default function last<V>(src: Observable<V>): Observable<V> {
  var lastEvent: Event<V>;
  return src.transform<V>(function (event, sink) {
    if (isEnd(event)) {
      if (lastEvent) {
        sink(lastEvent);
      }
      sink(endEvent());
      return noMore;
    } else {
      lastEvent = event;
    }
  }).withDesc(new Desc(src, "last", []));
}