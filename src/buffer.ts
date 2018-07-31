import { EventStream } from "./observable";
import { Desc } from "./describe";
import { End, Event, hasValue, nextEvent } from "./event";
import { more, noMore } from "./reply";
import { nop } from "./helpers";
import GlobalScheduler from "./scheduler"
import { EventSink } from "./types";

export type DelayFunction = (any) => any

/** @hidden */
export function bufferWithTime<V>(src: EventStream<V>, delay: number | DelayFunction): EventStream<V> {
  return bufferWithTimeOrCount(src, delay, Number.MAX_VALUE).withDesc(new Desc(src, "bufferWithTime", [delay]));
};

/** @hidden */
export function bufferWithCount<V>(src: EventStream<V>, count: number): EventStream<V> {
  return bufferWithTimeOrCount(src,undefined, count).withDesc(new Desc(src, "bufferWithCount", [count]));
};

/** @hidden */
export function bufferWithTimeOrCount<V>(src: EventStream<V>, delay?: number | DelayFunction, count?: number): EventStream<V> {
  function flushOrSchedule(buffer: Buffer<V>) {
    if (buffer.values.length === count) {
      //console.log Bacon.scheduler.now() + ": count-flush"
      return buffer.flush();
    } else if (delay !== undefined) {
      return buffer.schedule();
    }
  }
  var desc = new Desc(src, "bufferWithTimeOrCount", [delay, count]);
  return buffer(src, delay, flushOrSchedule, flushOrSchedule).withDesc(desc);
}

class Buffer<V> {
  constructor(onFlush, onInput, delay) {
    this.onFlush = onFlush
    this.onInput = onInput
    this.delay = delay
  }
  delay: DelayFunction
  onInput: BufferHandler<V>
  onFlush: BufferHandler<V>
  push: EventSink<V> = (e) => {}
  scheduled: number | null = null
  end: End<V> | undefined = undefined
  values: V[] = []
  flush() {
    if (this.scheduled) {
      GlobalScheduler.scheduler.clearTimeout(this.scheduled);
      this.scheduled = null;
    }
    if (this.values.length > 0) {
      //console.log Bacon.scheduler.now() + ": flush " + @values
      var valuesToPush = this.values;
      this.values = [];
      var reply = this.push(nextEvent(valuesToPush));
      if ((this.end != null)) {
        return this.push(this.end);
      } else if (reply !== noMore) {
        return this.onFlush(this);
      }
    } else {
      if ((this.end != null)) { return this.push(this.end); }
    }
  }
  schedule() {
    if (!this.scheduled) {
      return this.scheduled = this.delay(() => {
        //console.log Bacon.scheduler.now() + ": scheduled flush"
        return this.flush();
      });
    }
  }

}

interface BufferHandler<V> {
  (buffer: Buffer<V>): any
}

/** @hidden */
export function buffer<V>(src: EventStream<V>, delay?: number | DelayFunction, onInput: BufferHandler<V> = nop, onFlush: BufferHandler<V> = nop): EventStream<V> {
  var reply = more;
  if (typeof delay === "number") {
    var delayMs = delay;
    delay = function(f) {
      //console.log Bacon.scheduler.now() + ": schedule for " + (Bacon.scheduler.now() + delayMs)
      return GlobalScheduler.scheduler.setTimeout(f, delayMs);
    };
  }

  var buffer = new Buffer<V>(onFlush, onInput, delay)

  return src.transform((event: Event<V>, sink: EventSink<V>) => {
    buffer.push = sink
    if (hasValue(event)) {
      buffer.values.push(event.value);
      //console.log Bacon.scheduler.now() + ": input " + event.value
      onInput(buffer);
    } else if (event.isError) {
      reply = sink(event);
    } else if (event.isEnd) {
      buffer.end = event;
      if (!buffer.scheduled) {
        //console.log Bacon.scheduler.now() + ": end-flush"
        buffer.flush();
      }
    }
    return reply;
  }).withDesc(new Desc(src, "buffer", []))
};
