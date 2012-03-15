(function() {
  var Bacon, Bus, Dispatcher, End, Event, EventStream, Initial, Next, Observable, Property, assert, assertArray, assertEvent, assertFunction, cloneArray, cloneObject, empty, end, former, head, initial, latter, next, nop, remove, tail, _ref,
    _this = this,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = this.jQuery || this.Zepto) != null) {
    _ref.fn.asEventStream = function(eventName) {
      var element;
      element = this;
      return new EventStream(function(sink) {
        var handler, unbind;
        handler = function(event) {
          var reply;
          reply = sink(next(event));
          if (reply === Bacon.noMore) return unbind();
        };
        unbind = function() {
          return element.unbind(eventName, handler);
        };
        element.bind(eventName, handler);
        return unbind;
      });
    };
  }

  Bacon = this.Bacon = {
    taste: "delicious"
  };

  Bacon.noMore = "veggies";

  Bacon.more = "moar bacon!";

  Bacon.never = function() {
    return new EventStream(function(sink) {
      return function() {
        return nop;
      };
    });
  };

  Bacon.later = function(delay, value) {
    return Bacon.sequentially(delay, [value]);
  };

  Bacon.sequentially = function(delay, values) {
    return Bacon.repeatedly(delay, values).take(values.length);
  };

  Bacon.repeatedly = function(delay, values) {
    var index, poll;
    index = -1;
    poll = function() {
      index++;
      return next(values[index % values.length]);
    };
    return Bacon.fromPoll(delay, poll);
  };

  Bacon.fromPoll = function(delay, poll) {
    return new EventStream(function(sink) {
      var handler, id, unbind;
      id = void 0;
      handler = function() {
        var reply, value;
        value = poll();
        reply = sink(value);
        if (reply === Bacon.noMore || value.isEnd()) return unbind();
      };
      unbind = function() {
        return clearInterval(id);
      };
      id = setInterval(handler, delay);
      return unbind;
    });
  };

  Bacon.interval = function(delay, value) {
    var poll;
    if (value == null) value = {};
    poll = function() {
      return next(value);
    };
    return Bacon.fromPoll(delay, poll);
  };

  Bacon.pushStream = function() {
    var d, pushStream;
    d = new Dispatcher;
    pushStream = d.toEventStream();
    pushStream.push = function(value) {
      return d.push(next(value));
    };
    pushStream.end = function() {
      return d.push(end());
    };
    return pushStream;
  };

  Bacon.constant = function(value) {
    return new Property(function(sink) {
      sink(initial(value));
      return sink(end());
    });
  };

  Bacon.combineAll = function(streams, f) {
    var next, stream, _i, _len, _ref2;
    assertArray(streams);
    stream = head(streams);
    _ref2 = tail(streams);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      next = _ref2[_i];
      stream = f(stream, next);
    }
    return stream;
  };

  Bacon.mergeAll = function(streams) {
    return Bacon.combineAll(streams, function(s1, s2) {
      return s1.merge(s2);
    });
  };

  Bacon.combineAsArray = function(streams) {
    var concatArrays, toArray;
    toArray = function(x) {
      if (x != null) {
        if (x instanceof Array) {
          return x;
        } else {
          return [x];
        }
      } else {
        return [];
      }
    };
    concatArrays = function(a1, a2) {
      return toArray(a1).concat(toArray(a2));
    };
    return Bacon.combineAll(streams, function(s1, s2) {
      return s1.toProperty().combine(s2, concatArrays);
    });
  };

  Bacon.latestValue = function(src) {
    var latest,
      _this = this;
    latest = void 0;
    src.subscribe(function(event) {
      if (event.hasValue()) return latest = event.value;
    });
    return function() {
      return latest;
    };
  };

  Event = (function() {

    function Event() {}

    Event.prototype.isEvent = function() {
      return true;
    };

    Event.prototype.isEnd = function() {
      return false;
    };

    Event.prototype.isInitial = function() {
      return false;
    };

    Event.prototype.isNext = function() {
      return false;
    };

    Event.prototype.hasValue = function() {
      return false;
    };

    return Event;

  })();

  Next = (function(_super) {

    __extends(Next, _super);

    function Next(value) {
      this.value = value;
    }

    Next.prototype.isNext = function() {
      return true;
    };

    Next.prototype.hasValue = function() {
      return true;
    };

    Next.prototype.fmap = function(f) {
      return next(f(this.value));
    };

    Next.prototype.apply = function(value) {
      return next(value);
    };

    return Next;

  })(Event);

  Initial = (function(_super) {

    __extends(Initial, _super);

    function Initial() {
      Initial.__super__.constructor.apply(this, arguments);
    }

    Initial.prototype.isInitial = function() {
      return true;
    };

    Initial.prototype.isNext = function() {
      return false;
    };

    Initial.prototype.fmap = function(f) {
      return initial(f(this.value));
    };

    Initial.prototype.apply = function(value) {
      return initial(value);
    };

    return Initial;

  })(Next);

  End = (function(_super) {

    __extends(End, _super);

    function End() {}

    End.prototype.isEnd = function() {
      return true;
    };

    End.prototype.fmap = function() {
      return this;
    };

    End.prototype.apply = function() {
      return this;
    };

    return End;

  })(Event);

  Observable = (function() {

    function Observable() {}

    Observable.prototype.onValue = function(f) {
      return this.subscribe(function(event) {
        if (event.hasValue()) return f(event.value);
      });
    };

    return Observable;

  })();

  EventStream = (function(_super) {

    __extends(EventStream, _super);

    function EventStream(subscribe) {
      this["switch"] = __bind(this["switch"], this);
      var dispatcher;
      assertFunction(subscribe);
      dispatcher = new Dispatcher(subscribe);
      this.subscribe = dispatcher.subscribe;
      this.hasSubscribers = dispatcher.hasSubscribers;
    }

    EventStream.prototype.filter = function(f) {
      return this.withHandler(function(event) {
        if (event.isEnd() || f(event.value)) {
          return this.push(event);
        } else {
          return Bacon.more;
        }
      });
    };

    EventStream.prototype.takeWhile = function(f) {
      return this.withHandler(function(event) {
        if (event.isEnd() || f(event.value)) {
          return this.push(event);
        } else {
          this.push(end());
          return Bacon.noMore;
        }
      });
    };

    EventStream.prototype.take = function(count) {
      assert("take: count must >= 1", count >= 1);
      return this.withHandler(function(event) {
        if (event.isEnd()) {
          return this.push(event);
        } else if (count === 1) {
          this.push(event);
          this.push(end());
          return Bacon.noMore;
        } else {
          count--;
          return this.push(event);
        }
      });
    };

    EventStream.prototype.skip = function(count) {
      assert("skip: count must >= 0", count >= 0);
      return this.withHandler(function(event) {
        if (event.isEnd()) {
          return this.push(event);
        } else if (count > 0) {
          count--;
          return Bacon.more;
        } else {
          return this.push(event);
        }
      });
    };

    EventStream.prototype.map = function(f) {
      return this.withHandler(function(event) {
        return this.push(event.fmap(f));
      });
    };

    EventStream.prototype.flatMap = function(f) {
      var root;
      root = this;
      return new EventStream(function(sink) {
        var checkEnd, children, rootEnd, spawner, unbind, unsubRoot;
        children = [];
        rootEnd = false;
        unsubRoot = function() {};
        unbind = function() {
          var unsubChild, _i, _len;
          unsubRoot();
          for (_i = 0, _len = children.length; _i < _len; _i++) {
            unsubChild = children[_i];
            unsubChild();
          }
          return children = [];
        };
        checkEnd = function() {
          if (rootEnd && (children.length === 0)) return sink(end());
        };
        spawner = function(event) {
          var child, handler, removeChild, unsubChild;
          if (event.isEnd()) {
            rootEnd = true;
            return checkEnd();
          } else {
            child = f(event.value);
            unsubChild = void 0;
            removeChild = function() {
              if (unsubChild != null) remove(unsubChild, children);
              return checkEnd();
            };
            handler = function(event) {
              var reply;
              if (event.isEnd()) {
                removeChild();
                return Bacon.noMore;
              } else {
                reply = sink(event);
                if (reply === Bacon.noMore) unbind();
                return reply;
              }
            };
            unsubChild = child.subscribe(handler);
            return children.push(unsubChild);
          }
        };
        unsubRoot = root.subscribe(spawner);
        return unbind;
      });
    };

    EventStream.prototype["switch"] = function(f) {
      var _this = this;
      return this.flatMap(function(value) {
        return f(value).takeUntil(_this);
      });
    };

    EventStream.prototype.delay = function(delay) {
      return this.flatMap(function(value) {
        return Bacon.later(delay, value);
      });
    };

    EventStream.prototype.throttle = function(delay) {
      return this["switch"](function(value) {
        return Bacon.later(delay, value);
      });
    };

    EventStream.prototype.bufferWithTime = function(delay) {
      var buffer, flush, storeAndMaybeTrigger, values;
      values = [];
      storeAndMaybeTrigger = function(value) {
        values.push(value);
        return values.length === 1;
      };
      flush = function() {
        var output;
        output = values;
        values = [];
        return output;
      };
      buffer = function() {
        return Bacon.later(delay).map(flush);
      };
      return this.filter(storeAndMaybeTrigger).flatMap(buffer);
    };

    EventStream.prototype.bufferWithCount = function(count) {
      var values;
      values = [];
      return this.withHandler(function(event) {
        var flush,
          _this = this;
        flush = function() {
          _this.push(next(values));
          return values = [];
        };
        if (event.isEnd()) {
          flush();
          return this.push(event);
        } else {
          values.push(event.value);
          if (values.length === count) return flush();
        }
      });
    };

    EventStream.prototype.merge = function(right) {
      var left;
      left = this;
      return new EventStream(function(sink) {
        var ends, smartSink, unsubBoth, unsubLeft, unsubRight;
        unsubLeft = nop;
        unsubRight = nop;
        unsubBoth = function() {
          unsubLeft();
          return unsubRight();
        };
        ends = 0;
        smartSink = function(event) {
          var reply;
          if (event.isEnd()) {
            ends++;
            if (ends === 2) {
              return sink(end());
            } else {
              return Bacon.more;
            }
          } else {
            reply = sink(event);
            if (reply === Bacon.noMore) unsubBoth();
            return reply;
          }
        };
        unsubLeft = left.subscribe(smartSink);
        unsubRight = right.subscribe(smartSink);
        return unsubBoth;
      });
    };

    EventStream.prototype.takeUntil = function(stopper) {
      var src;
      src = this;
      return new EventStream(function(sink) {
        var srcSink, stopperSink, unsubBoth, unsubSrc, unsubStopper;
        unsubSrc = nop;
        unsubStopper = nop;
        unsubBoth = function() {
          unsubSrc();
          return unsubStopper();
        };
        srcSink = function(event) {
          var reply;
          if (event.isEnd()) unsubStopper();
          reply = sink(event);
          if (reply === Bacon.noMore) unsubStopper();
          return reply;
        };
        stopperSink = function(event) {
          if (!event.isEnd()) {
            unsubSrc();
            sink(end());
          }
          return Bacon.noMore;
        };
        unsubSrc = src.subscribe(srcSink);
        unsubStopper = stopper.subscribe(stopperSink);
        return unsubBoth;
      });
    };

    EventStream.prototype.toProperty = function(initValue) {
      return this.scan(initValue, latter);
    };

    EventStream.prototype.scan = function(seed, f) {
      var acc, d, handleEvent, subscribe;
      acc = seed;
      handleEvent = function(event) {
        if (!event.isEnd()) acc = f(acc, event.value);
        return this.push(event.apply(acc));
      };
      d = new Dispatcher(this.subscribe, handleEvent);
      subscribe = function(sink) {
        if (acc != null) sink(initial(acc));
        return d.subscribe(sink);
      };
      return new Property(subscribe);
    };

    EventStream.prototype.distinctUntilChanged = function() {
      return this.withStateMachine(void 0, function(prev, event) {
        if (event.isEnd() || prev !== event.value) {
          return [event.value, [event]];
        } else {
          return [prev, []];
        }
      });
    };

    EventStream.prototype.withStateMachine = function(initState, f) {
      var state;
      state = initState;
      return this.withHandler(function(event) {
        var fromF, newState, output, outputs, reply, _i, _len;
        fromF = f(state, event);
        assertArray(fromF);
        newState = fromF[0], outputs = fromF[1];
        assertArray(outputs);
        state = newState;
        reply = Bacon.more;
        for (_i = 0, _len = outputs.length; _i < _len; _i++) {
          output = outputs[_i];
          reply = this.push(output);
          if (reply === Bacon.noMore) return reply;
        }
        return reply;
      });
    };

    EventStream.prototype.decorateWith = function(label, property) {
      return property.sampledBy(this, function(propertyValue, streamValue) {
        var result;
        result = cloneObject(streamValue);
        result[label] = propertyValue;
        return result;
      });
    };

    EventStream.prototype.end = function(value) {
      if (value == null) value = "end";
      return this.withHandler(function(event) {
        if (event.isEnd()) {
          this.push(next(value));
          this.push(end());
          return Bacon.noMore;
        } else {
          return Bacon.more;
        }
      });
    };

    EventStream.prototype.withHandler = function(handler) {
      return new Dispatcher(this.subscribe, handler).toEventStream();
    };

    EventStream.prototype.toString = function() {
      return "EventStream";
    };

    return EventStream;

  })(Observable);

  Property = (function(_super) {

    __extends(Property, _super);

    function Property(subscribe) {
      var combine,
        _this = this;
      this.subscribe = subscribe;
      this.toProperty = __bind(this.toProperty, this);
      this.changes = __bind(this.changes, this);
      this.takeUntil = __bind(this.takeUntil, this);
      this.filter = __bind(this.filter, this);
      this.map = __bind(this.map, this);
      this.sample = __bind(this.sample, this);
      combine = function(other, leftSink, rightSink) {
        var myVal, otherVal;
        myVal = void 0;
        otherVal = void 0;
        return new Property(function(sink) {
          var checkEnd, combiningSink, myEnd, mySink, otherEnd, otherSink, unsubBoth, unsubMe, unsubOther;
          unsubMe = nop;
          unsubOther = nop;
          unsubBoth = function() {
            unsubMe();
            return unsubOther();
          };
          myEnd = false;
          otherEnd = false;
          checkEnd = function() {
            if (myEnd && otherEnd) return sink(end());
          };
          combiningSink = function(markEnd, setValue, thisSink) {
            return function(event) {
              var reply;
              if (event.isEnd()) {
                markEnd();
                checkEnd();
                return Bacon.noMore;
              } else {
                setValue(event.value);
                if ((myVal != null) && (otherVal != null)) {
                  reply = thisSink(sink, event, myVal, otherVal);
                  if (reply === Bacon.noMore) unsubBoth;
                  return reply;
                } else {
                  return Bacon.more;
                }
              }
            };
          };
          mySink = combiningSink((function() {
            return myEnd = true;
          }), (function(value) {
            return myVal = value;
          }), leftSink);
          otherSink = combiningSink((function() {
            return otherEnd = true;
          }), (function(value) {
            return otherVal = value;
          }), rightSink);
          unsubMe = _this.subscribe(mySink);
          unsubOther = other.subscribe(otherSink);
          return unsubBoth;
        });
      };
      this.combine = function(other, combinator) {
        var combineAndPush;
        combineAndPush = function(sink, event, myVal, otherVal) {
          return sink(event.apply(combinator(myVal, otherVal)));
        };
        return combine(other, combineAndPush, combineAndPush);
      };
      this.sampledBy = function(sampler, combinator) {
        var pushPropertyValue;
        if (combinator == null) combinator = former;
        pushPropertyValue = function(sink, event, propertyVal, streamVal) {
          return sink(event.apply(combinator(propertyVal, streamVal)));
        };
        return combine(sampler, nop, pushPropertyValue).changes().takeUntil(sampler.end());
      };
    }

    Property.prototype.sample = function(interval) {
      return this.sampledBy(Bacon.interval(interval, {}));
    };

    Property.prototype.map = function(f) {
      var _this = this;
      return new Property(function(sink) {
        return _this.subscribe(function(event) {
          return sink(event.fmap(f));
        });
      });
    };

    Property.prototype.filter = function(f) {
      var _this = this;
      return new Property(function(sink) {
        return _this.subscribe(function(event) {
          if (event.isEnd() || f(event.value)) {
            return sink(event);
          } else {
            return Bacon.more;
          }
        });
      });
    };

    Property.prototype.takeUntil = function(stopper) {
      return this.sampledBy(this.changes().takeUntil(stopper));
    };

    Property.prototype.changes = function() {
      var _this = this;
      return new EventStream(function(sink) {
        return _this.subscribe(function(event) {
          if (!event.isInitial()) return sink(event);
        });
      });
    };

    Property.prototype.toProperty = function() {
      return this;
    };

    return Property;

  })(Observable);

  Dispatcher = (function() {

    function Dispatcher(subscribe, handleEvent) {
      var removeSink, sinks, unsubscribeFromSource,
        _this = this;
      if (subscribe == null) {
        subscribe = function() {
          return nop;
        };
      }
      sinks = [];
      this.hasSubscribers = function() {
        return sinks.length > 0;
      };
      unsubscribeFromSource = nop;
      removeSink = function(sink) {
        return remove(sink, sinks);
      };
      this.push = function(event) {
        var reply, sink, _i, _len, _ref2;
        assertEvent(event);
        _ref2 = cloneArray(sinks);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          sink = _ref2[_i];
          reply = sink(event);
          if (reply === Bacon.noMore || event.isEnd()) removeSink(sink);
        }
        if (_this.hasSubscribers()) {
          return Bacon.more;
        } else {
          return Bacon.noMore;
        }
      };
      if (handleEvent == null) {
        handleEvent = function(event) {
          return this.push(event);
        };
      }
      this.handleEvent = function(event) {
        assertEvent(event);
        return handleEvent.apply(_this, [event]);
      };
      this.subscribe = function(sink) {
        assertFunction(sink);
        sinks.push(sink);
        if (sinks.length === 1) {
          unsubscribeFromSource = subscribe(_this.handleEvent);
        }
        assertFunction(unsubscribeFromSource);
        return function() {
          removeSink(sink);
          if (!_this.hasSubscribers()) return unsubscribeFromSource();
        };
      };
    }

    Dispatcher.prototype.toEventStream = function() {
      return new EventStream(this.subscribe);
    };

    Dispatcher.prototype.toString = function() {
      return "Dispatcher";
    };

    return Dispatcher;

  })();

  Bus = (function(_super) {

    __extends(Bus, _super);

    function Bus() {
      var dispatcher, guardedSink, inputs, sink, subscribeAll, subscribeThis, unsubFuncs,
        _this = this;
      sink = void 0;
      unsubFuncs = [];
      inputs = [];
      guardedSink = function(event) {
        if (event.isEnd()) {
          return Bacon.noMore;
        } else {
          return sink(event);
        }
      };
      subscribeAll = function(newSink) {
        var input, unsubAll, _i, _len;
        sink = newSink;
        unsubFuncs = [];
        for (_i = 0, _len = inputs.length; _i < _len; _i++) {
          input = inputs[_i];
          unsubFuncs.push(input.subscribe(guardedSink));
        }
        unsubAll = function() {
          var f, _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = unsubFuncs.length; _j < _len2; _j++) {
            f = unsubFuncs[_j];
            _results.push(f());
          }
          return _results;
        };
        return unsubAll;
      };
      dispatcher = new Dispatcher(subscribeAll);
      subscribeThis = function(sink) {
        return dispatcher.subscribe(sink);
      };
      Bus.__super__.constructor.call(this, subscribeThis);
      this.plug = function(inputStream) {
        inputs.push(inputStream);
        if ((sink != null)) {
          return unsubFuncs.push(inputStream.subscribe(guardedSink));
        }
      };
      this.push = function(value) {
        return sink(next(value));
      };
      this.end = function() {
        return sink(end());
      };
    }

    return Bus;

  })(EventStream);

  Bacon.EventStream = EventStream;

  Bacon.Property = Property;

  Bacon.Bus = Bus;

  Bacon.Initial = Initial;

  Bacon.Next = Next;

  Bacon.End = End;

  nop = function() {};

  latter = function(_, x) {
    return x;
  };

  former = function(x, _) {
    return x;
  };

  initial = function(value) {
    return new Initial(value);
  };

  next = function(value) {
    return new Next(value);
  };

  end = function() {
    return new End();
  };

  empty = function(xs) {
    return xs.length === 0;
  };

  head = function(xs) {
    return xs[0];
  };

  tail = function(xs) {
    return xs.slice(1, xs.length);
  };

  cloneArray = function(xs) {
    return xs.slice(0);
  };

  cloneObject = function(src) {
    var clone, key, value;
    clone = {};
    for (key in src) {
      value = src[key];
      clone[key] = value;
    }
    return clone;
  };

  remove = function(x, xs) {
    var i;
    i = xs.indexOf(x);
    if (i >= 0) return xs.splice(i, 1);
  };

  assert = function(message, condition) {
    if (!condition) throw message;
  };

  assertEvent = function(event) {
    assert("not an event : " + event, event.isEvent != null);
    return assert("not event", event.isEvent());
  };

  assertFunction = function(f) {
    return assert("not a function : " + f, typeof f === "function");
  };

  assertArray = function(xs) {
    return assert("not an array : " + xs, xs instanceof Array);
  };

}).call(this);
