import { endEvent, Event, isEnd, nextEvent } from "./event";
import { noMore } from "./reply";
import { EventSink } from "./types";
import _ from "./_";
import { Transformer } from "./transform";

export default function mapEndT<V>(f: ((End) => V) | V): Transformer<V, V> {
  let theF = _.toFunction(f)
  return function(event: Event<V>, sink: EventSink<V>) {
    if (isEnd(event)) {
      sink(nextEvent(theF(event)))
      sink(endEvent())
      return noMore
    } else {
      return sink(event)
    }
  }
}