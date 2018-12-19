import fromPoll from "./frompoll";
import { nextEvent } from "./event";
import { Desc } from "./describe";
import { EventStream } from "./observable";

/**
 Repeats the single element indefinitely with the given interval (in milliseconds)

 @param   delay   Repeat delay in milliseconds
 @param   value   The single value to repeat
 @typeparam V Type of stream elements
 */
export default function interval<V>(delay: number, value: V): EventStream<V> {
  return fromPoll<V>(delay, function () {
    return nextEvent(value);
  }).withDesc(new Desc("Bacon", "interval", [delay, value]));
}
