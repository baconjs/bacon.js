import Observable from "./Observable";
import Dispatcher from "./Dispatcher";
import registerObs from "../helpers/registerObs";
import isFunction from "../helpers/isFunction";
import assertFunction from "../helpers/assertFunction";
import assertEventStream from "../helpers/assertEventStream";
import withDescription from "../helpers/withDescription";
import convertArgsToFunction from "../helpers/convertArgsToFunction";
import id from "../helpers/id";
import nop from "../helpers/nop";
import next from "../helpers/next";

var idCounter = 0;

export default class EventStream extends Observable {
  constructor(desc, subscribe, handler) {
    if (isFunction(desc)) {
      handler = subscribe;
      subscribe = desc;
      desc = [];
    }

    super(desc);
    assertFunction(subscribe);
    this.dispatcher = new Dispatcher(subscribe, handler);
    registerObs(this);
  }
  delay(delay) {
    return withDescription(this, "delay", delay, this.flatMap(function(value) {
      return Bacon.later(delay, value);
    }));
  }
  debounce(delay) {
    return withDescription(this, "debounce", delay, this.flatMapLatest(function(value) {
      return Bacon.later(delay, value);
    }));
  }
  debounceImmediate(delay) {
    return withDescription(this, "debounceImmediate", delay, this.flatMapFirst(function(value) {
      return Bacon.once(value).concat(Bacon.later(delay).filter(false));
    }));
  }
  throttle(delay) {
    return withDescription(this, "throttle", delay, this.bufferWithTime(delay).map(function(values) {
      return values[values.length - 1];
    }));
  }
  bufferWithTime(delay) {
    return withDescription(this, "bufferWithTime", delay, this.bufferWithTimeOrCount(delay, Number.MAX_VALUE));
  }
  bufferWithCount(count) {
    return withDescription(this, "bufferWithCount", count, this.bufferWithTimeOrCount(void 0, count));
  }
  bufferWithTimeOrCount(delay, count) {
    var flushOrSchedule;
    flushOrSchedule = function(buffer) {
      if (buffer.values.length === count) {
        return buffer.flush();
      } else if (delay !== void 0) {
        return buffer.schedule();
      }
    };
    return withDescription(this, "bufferWithTimeOrCount", delay, count, this.buffer(delay, flushOrSchedule, flushOrSchedule));
  }
  buffer(delay, onInput = nop, onFlush = nop) {
    var buffer, delayMs, reply;
    if (!onInput) {
      onInput = nop;
    }
    if (!onFlush) {
      onFlush = nop;
    }
    buffer = {
      scheduled: false,
      end: void 0,
      values: [],
      flush: function() {
        var reply;
        this.scheduled = false;
        if (this.values.length > 0) {
          reply = this.push(next(this.values));
          this.values = [];
          if (this.end) {
            return this.push(this.end);
          } else if (reply !== Bacon.noMore) {
            return onFlush(this);
          }
        } else {
          if (this.end) {
            return this.push(this.end);
          }
        }
      },
      schedule: function() {
        if (!this.scheduled) {
          this.scheduled = true;
          return delay((function(_this) {
            return function() {
              return _this.flush();
            };
          })(this));
        }
      }
    };
    reply = Bacon.more;
    if (!isFunction(delay)) {
      delayMs = delay;
      delay = function(f) {
        return Bacon.scheduler.setTimeout(f, delayMs);
      };
    }
    return withDescription(this, "buffer", this.withHandler(function(event) {
      buffer.push = (function(_this) {
        return function(event) {
          return _this.push(event);
        };
      })(this);
      if (event.isError()) {
        reply = this.push(event);
      } else if (event.isEnd()) {
        buffer.end = event;
        if (!buffer.scheduled) {
          buffer.flush();
        }
      } else {
        buffer.values.push(event.value());
        onInput(buffer);
      }
      return reply;
    }));
  }
  merge(right) {
    var left;
    assertEventStream(right);
    left = this;
    return withDescription(left, "merge", right, Bacon.mergeAll(this, right));
  }
  toProperty(initValue_) {
    var disp, initValue;
    initValue = arguments.length === 0 ? None : toOption(function() {
      return initValue_;
    });
    disp = this.dispatcher;
    return new Property(describe(this, "toProperty", initValue_), function(sink) {
      var initSent, reply, sendInit, unsub;
      initSent = false;
      unsub = nop;
      reply = Bacon.more;
      sendInit = function() {
        if (!initSent) {
          return initValue.forEach(function(value) {
            initSent = true;
            reply = sink(new Initial(value));
            if (reply === Bacon.noMore) {
              unsub();
              return unsub = nop;
            }
          });
        }
      };
      unsub = disp.subscribe(function(event) {
        if (event.hasValue()) {
          if (initSent && event.isInitial()) {
            return Bacon.more;
          } else {
            if (!event.isInitial()) {
              sendInit();
            }
            initSent = true;
            initValue = new Some(event);
            return sink(event);
          }
        } else {
          if (event.isEnd()) {
            reply = sendInit();
          }
          if (reply !== Bacon.noMore) {
            return sink(event);
          }
        }
      });
      sendInit();
      return unsub;
    });
  }
  toEventStream() {
    return this;
  }
  sampledBy(sampler, combinator) {
    return withDescription(this, "sampledBy", sampler, combinator, this.toProperty().sampledBy(sampler, combinator));
  }
  concat(right) {
    var left;
    left = this;
    return new EventStream(describe(left, "concat", right), function(sink) {
      var unsubLeft, unsubRight;
      unsubRight = nop;
      unsubLeft = left.dispatcher.subscribe(function(e) {
        if (e.isEnd()) {
          return right.dispatcher.subscribe(sink);
        } else {
          return sink(e);
        }
      });
      return function() {
        unsubLeft();
        return unsubRight();
      };
    });
  }
  takeUntil(stopper) {
    var endMarker;
    endMarker = {};
    return withDescription(this, "takeUntil", stopper, Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors()).withHandler(function(event) {
      var data, reply, value, _i, _len, _ref1;
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        _ref1 = event.value();
        data = _ref1[0];
        stopper = _ref1[1];
        if (stopper.length) {
          return this.push(end());
        } else {
          reply = Bacon.more;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            value = data[_i];
            if (value === endMarker) {
              reply = this.push(end());
            } else {
              reply = this.push(next(value));
            }
          }
          return reply;
        }
      }
    }));
  }
  skipUntil(starter) {
    var started;
    started = starter.take(1).map(true).toProperty(false);
    return withDescription(this, "skipUntil", starter, this.filter(started));
  }
  skipWhile(f, ...args) {
    var ok;
    ok = false;
    return convertArgsToFunction(this, f, args, function(f) {
      return withDescription(this, "skipWhile", f, this.withHandler(function(event) {
        if (ok || !event.hasValue() || !f(event.value())) {
          if (event.hasValue()) {
            ok = true;
          }
          return this.push(event);
        } else {
          return Bacon.more;
        }
      }));
    });
  }
  holdWhen(valve) {
    var putToHold, releaseHold, valve_;
    valve_ = valve.startWith(false);
    releaseHold = valve_.filter(function(x) {
      return !x;
    });
    putToHold = valve_.filter(_.id);
    return withDescription(this, "holdWhen", valve, this.filter(false).merge(valve_.flatMapConcat((function(_this) {
      return function(shouldHold) {
        if (!shouldHold) {
          return _this.takeUntil(putToHold);
        } else {
          return _this.scan([], (function(xs, x) {
            return xs.concat(x);
          })).sampledBy(releaseHold).take(1).flatMap(Bacon.fromArray);
        }
      };
    })(this))));
  }
  startWith(seed) {
    withDescription(this, "startWith", seed, Bacon.once(seed).concat(this));
  }

  withHandler(handler) {
    new EventStream(describe(this, "withHandler", handler), this.dispatcher.subscribe, handler);
  }
}