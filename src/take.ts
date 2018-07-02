import { noMore } from "./reply";
import { endEvent, Event } from "./event";
import { EventSink } from "./types"
import { Desc } from "./describe"
import Observable from "./observable";

export function take<V>(count: number, src: Observable<V>): Observable<V> {
  return src.transform(takeT(count), new Desc(src, "take", [count]))
}

export function takeT<V>(count) { return (e: Event<V>, sink: EventSink<V>) => {
    if (!e.hasValue) {
      return sink(e);
    } else {
      count--;
      if (count > 0) {
        return sink(e);
      } else {
        if (count === 0) { sink(e) }
        sink(endEvent());
        return noMore;
      }
    }
  }
}
