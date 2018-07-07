import { Desc } from "./describe";
import { more } from "./reply";
import Observable from "./observable";
import Event, { isError } from "./event"
import { EventSink } from "./types";

export default function skipErrors<V>(src: Observable<V>): Observable<V> {
  return src.transform(function(event: Event<V>, sink: EventSink<V>) {
    if (isError(event)) {
      return more
    } else {
      return sink(event)
    }
  }, new Desc(src, "skipErrors", []))
}
