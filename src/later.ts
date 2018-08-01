import { Desc } from "./describe";
import { endEvent } from "./event";
import fromBinder from "./frombinder";
import "./scheduler"
import GlobalScheduler from "./scheduler";
import { EventStream } from "./observable";
import { EventSink } from "./types";

/**

 Creates a single-element stream that emits given value after given delay and ends.

 @param delay delay in milliseconds
 @param value value to be emitted
 @typeparam V Type of stream elements

 */
export default function later<V>(delay: number, value: V): EventStream<V> {
  return fromBinder(function (sink: EventSink<V>) {
    var sender = function () {
      return sink([value, endEvent()])
    }
    var id = GlobalScheduler.scheduler.setTimeout(sender, delay)
    return function () {
      return GlobalScheduler.scheduler.clearTimeout(id)
    }
  }).withDesc(new Desc("Bacon", "later", [delay, value]))
}