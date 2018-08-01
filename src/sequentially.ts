import fromPoll from "./frompoll";
import { Desc } from "./describe";
import { endEvent, Event, toEvent } from "./event";
import { EventStream } from "./observable";
import { EventLike } from "./frombinder";

/**
 Creates a stream containing given
 values (given as array). Delivered with given interval in milliseconds.

 @param delay between elements, in milliseconds
 @param array of values or events
 @typeparam V Type of stream elements

 */
export default function sequentially<V>(delay: number, values: (V | Event<V>)[]): EventStream<V> {
  var index = 0;
  return fromPoll<V>(delay, function (): EventLike<V> {
    var value = values[index++];
    if (index < values.length) {
      return value;
    } else if (index === values.length) {
      return [toEvent(value), endEvent()];
    } else {
      return endEvent();
    }
  }).withDesc(new Desc("Bacon", "sequentially", [delay, values]));
}