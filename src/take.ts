import EventStream from "./eventstream";
import Property from "./property"
import { noMore } from "./reply";
import { endEvent } from "./event";
import { EventSink } from "./types"
import { Event } from "./event"
import { Desc } from "./describe"

export function takeE<V>(count: number, src: EventStream<V>): EventStream<V> {
  return src.transform(takeT(count), new Desc(src, "take", [count]))
}
export function takeP<V>(count: number, src: Property<V>): Property<V> {
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
