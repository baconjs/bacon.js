import { Event, isError, nextEvent } from "./event";
import { EventSink, Transformer } from "./types";
import _ from "./_";

export default function mapErrorT<V>(f: ((any) => V) | V): Transformer<V, V> {
  let theF = _.toFunction(f)
  return function(event: Event<V>, sink: EventSink<V>) {
    if (isError(event)) {
      return sink(nextEvent(theF(event.error)));
    } else {
      return sink(event);
    }
  }
}