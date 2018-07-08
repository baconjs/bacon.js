import Observable from "./observable";
import { Desc } from "./describe";
import { endEvent, Event, isError } from "./event";
import { EventSink } from "./types";

export default function endOnError<T>(src: Observable<T>, predicate: (any) => boolean = x => true) {
  return src.transform(
    (event: Event<T>, sink: EventSink<T>) => {
      if (isError(event) && predicate(event.error)) {
        sink(event);
        return sink(endEvent());
      } else {
        return sink(event);
      }
    },
    new Desc(src, "endOnError", []))
}