import { EventStream } from "./observable";
import { Desc } from "./describe";
import { End, Event, hasValue, nextEvent, isError, isEnd } from "./event";
import { more, noMore } from "./reply";
import { nop } from "./helpers";
import GlobalScheduler from "./scheduler"
import { EventSink } from "./types";

export type VoidFunction = () => void
/**
 *  Delay function used by `bufferWithTime` and `bufferWithTimeOrCount`. Your implementation should
 *  call the given void function to cause a buffer flush.
 */
export type DelayFunction = (f: VoidFunction) => any

/** @hidden */
export function bufferWithTime<V>(src: EventStream<V>, delay: number | DelayFunction): EventStream<V[]> {
  return bufferWithTimeOrCount(src, delay, Number.MAX_VALUE).withDesc(new Desc(src, "bufferWithTime", [delay]));
};

/** @hidden */
export function bufferWithCount<V>(src: EventStream<V>, count: number): EventStream<V[]> {
  return bufferWithTimeOrCount(src,undefined, count).withDesc(new Desc(src, "bufferWithCount", [count]));
};

/** @hidden */
export function bufferWithTimeOrCount<V>(src: EventStream<V>, delay?: number | DelayFunction, count?: number): EventStream<V[]> {
  const delayFunc = toDelayFunction(delay)
  function flushOrSchedule(buffer: Buffer<V>) {
    if (buffer.values.length === count) {
      //console.log Bacon.scheduler.now() + ": count-flush"
      return buffer.flush();
    } else if (delayFunc !== undefined) {
      return buffer.schedule(delayFunc);
    }
  }
  var desc = new Desc(src, "bufferWithTimeOrCount", [delay, count]);
  return buffer(src, flushOrSchedule, flushOrSchedule).withDesc(desc);
}

class Buffer<V> {
  constructor(onFlush: BufferHandler<V>, onInput: BufferHandler<V>) {
    this.onFlush = onFlush
    this.onInput = onInput
  }
  delay?: DelayFunction
  onInput: BufferHandler<V>
  onFlush: BufferHandler<V>
  push: EventSink<V[]> = (e) => more
  scheduled: number | null = null
  end: End | undefined = undefined
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
  schedule(delay: DelayFunction) {
    if (!this.scheduled) {
      return this.scheduled = delay(() => {
        //console.log Bacon.scheduler.now() + ": scheduled flush"
        return this.flush();
      });
    }
  }

}

function toDelayFunction(delay: number | DelayFunction | undefined): DelayFunction | undefined {
  if (delay === undefined) {
    return undefined
  }
  if (typeof delay === "number") {
    var delayMs = delay;
    return function(f) {
      //console.log Bacon.scheduler.now() + ": schedule for " + (Bacon.scheduler.now() + delayMs)
      return GlobalScheduler.scheduler.setTimeout(f, delayMs);
    };
  }
  return delay
}

type BufferHandler<V> = (buffer: Buffer<V>) => any

/** @hidden */
export function buffer<V>(src: EventStream<V>, onInput: BufferHandler<V> = nop, onFlush: BufferHandler<V> = nop): EventStream<V[]> {
  var reply = more;
  var buffer = new Buffer<V>(onFlush, onInput)

  return src.transform((event: Event<V>, sink: EventSink<V[]>) => {
    buffer.push = sink
    if (hasValue(event)) {
      buffer.values.push(event.value);
      //console.log Bacon.scheduler.now() + ": input " + event.value
      onInput(buffer);
    } else if (isError(event)) {
      reply = sink(event);
    } else if (isEnd(event)) {
      buffer.end = event;
      if (!buffer.scheduled) {
        //console.log Bacon.scheduler.now() + ": end-flush"
        buffer.flush();
      }
    }
    return reply;
  }).withDesc(new Desc(src, "buffer", []))
};
