import { Desc } from "./describe";
import { endEvent } from "./event";
import fromBinder from "./frombinder";
import "./scheduler"
import GlobalScheduler from "./scheduler";
import { EventStream } from "./observable";
import { EventSink } from "./types";

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