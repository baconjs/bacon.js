import EventStream from "./eventstream";
import { Desc } from "./describe";
import { nextEvent } from "./event";
import { more, noMore } from "./reply";
import { nop } from "./helpers";
import _ from "./_";
import Scheduler from "./scheduler"

EventStream.prototype.bufferWithTime = function(delay) {
  return this.bufferWithTimeOrCount(delay, Number.MAX_VALUE).withDesc(new Desc(this, "bufferWithTime", [delay]));
};

EventStream.prototype.bufferWithCount = function(count) {
  return this.bufferWithTimeOrCount(undefined, count).withDesc(new Desc(this, "bufferWithCount", [count]));
};

EventStream.prototype.bufferWithTimeOrCount = function(delay, count) {
  var flushOrSchedule = function(buffer) {
    if (buffer.values.length === count) {
      //console.log Bacon.scheduler.now() + ": count-flush"
      return buffer.flush();
    } else if (delay !== undefined) {
      return buffer.schedule();
    }
  };
  var desc = new Desc(this, "bufferWithTimeOrCount", [delay, count]);
  return this.buffer(delay, flushOrSchedule, flushOrSchedule).withDesc(desc);
};

EventStream.prototype.buffer = function(delay, onInput = nop, onFlush = nop) {
  var buffer = {
    scheduled: null,
    end: undefined,
    values: [],
    flush() {
      if (this.scheduled) {
        Scheduler.scheduler.clearTimeout(this.scheduled);
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
          return onFlush(this);
        }
      } else {
        if ((this.end != null)) { return this.push(this.end); }
      }
    },
    schedule() {
      if (!this.scheduled) {
        return this.scheduled = delay(() => {
          //console.log Bacon.scheduler.now() + ": scheduled flush"
          return this.flush();
        });
      }
    }
  };
  var reply = more;
  if (!_.isFunction(delay)) {
    var delayMs = delay;
    delay = function(f) {
      //console.log Bacon.scheduler.now() + ": schedule for " + (Bacon.scheduler.now() + delayMs)
      return Scheduler.scheduler.setTimeout(f, delayMs);
    };
  }
  return this.withHandler(function (event) {
    buffer.push = (event) => this.push(event);
    if (event.isError) {
      reply = this.push(event);
    } else if (event.isEnd) {
      buffer.end = event;
      if (!buffer.scheduled) {
        //console.log Bacon.scheduler.now() + ": end-flush"
        buffer.flush();
      }
    } else {
      buffer.values.push(event.value);
      //console.log Bacon.scheduler.now() + ": input " + event.value
      onInput(buffer);
    }
    return reply;
  }).withDesc(new Desc(this, "buffer", []));
};
