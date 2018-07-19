import { Desc } from "./describe";
import { endEvent } from "./event";
import Bacon from "./core";
import fromBinder from "./frombinder";
import "./scheduler"
import Scheduler from "./scheduler";
import { EventStream } from "./observable";
import { EventSink } from "./types";

export default function later<V>(delay: number, value: V): EventStream<V> {
  return fromBinder(function (sink: EventSink<V>) {
    var sender = function () {
      return sink([value, endEvent()])
    }
    var id = Scheduler.scheduler.setTimeout(sender, delay)
    return function () {
      return Scheduler.scheduler.clearTimeout(id)
    }
  }).withDesc(new Desc(Bacon, "later", [delay, value]))
}

Bacon.later = later
