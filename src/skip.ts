import { Desc } from "./describe";
import { more } from "./reply";
import Observable from "./observable";
import Event from "./event"
import { EventSink } from "./types";

/** @hidden */
export default function skip<T>(src: Observable<T>, count: number): Observable<T> {
  return src.transform((event: Event<T>, sink: EventSink<T>) => {
    if (!event.hasValue) {
      return sink(event);
    } else if (count > 0) {
      count--;
      return more;
    } else {
      return sink(event);
    }
  }, new Desc(src, "skip", [count]))
}
