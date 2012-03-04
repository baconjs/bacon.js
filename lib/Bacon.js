(function() {
  var Bacon, Dispatcher, End, Event, EventStream, Initial, Next, Observable, Property, assert, assertEvent, assertFunction, cloneArray, empty, end, head, initial, next, nop, remove, tail, _ref,
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

  Bacon.later = function(delay, value) {
    return Bacon.sequentially(delay, [value]);
  };

  Bacon.sequentially = function(delay, values) {
    var poll, valuesLeft;
    valuesLeft = values;
    poll = function() {
      var value;
      if (valuesLeft.length === 0) {
        return end();
      } else {
        value = head(valuesLeft);
        valuesLeft = tail(valuesLeft);
        return next(value);
      }
    };
    return Bacon.fromPoll(delay, poll);
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
    pushStream.push = function(event) {
      return d.push(next(event));
    };
    pushStream.end = function() {
      return d.push(end());
    };
    return pushStream;
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

    Initial.prototype.fmap = function(f) {
      return initial(f(this.value));
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
      return this.withHandler(function(event) {
        if (event.isEnd() || count > 0) {
          count--;
          return this.push(event);
        } else {
          this.push(end());
          return Bacon.noMore;
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
      var currentValue, d, handleEvent, subscribe;
      currentValue = initValue;
      handleEvent = function(event) {
        if (!event.isEnd) currentValue = event.value;
        return this.push(event);
      };
      d = new Dispatcher(this.subscribe, handleEvent);
      subscribe = function(sink) {
        if (currentValue != null) sink(initial(currentValue));
        return d.subscribe(sink);
      };
      return new Property(subscribe);
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
      this.subscribe = subscribe;
      this.changes = __bind(this.changes, this);
      this.map = __bind(this.map, this);
    }

    Property.prototype.map = function(f) {
      var _this = this;
      return new Property(function(sink) {
        return _this.subscribe(function(event) {
          return sink(event.fmap(f));
        });
      });
    };

    Property.prototype.changes = function() {
      var _this = this;
      return new EventStream(function(sink) {
        return _this.subscribe(function(event) {
          if (!event.isInitial()) return sink(event);
        });
      });
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

  Bacon.EventStream = EventStream;

  Bacon.Property = Property;

  Bacon.Initial = Initial;

  Bacon.Next = Next;

  Bacon.End = End;

  nop = function() {};

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

}).call(this);
