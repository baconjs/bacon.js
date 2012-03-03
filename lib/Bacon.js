(function() {
  var Bacon, Dispatcher, End, Event, EventStream, Initial, Next, Property, assert, assertEvent, empty, end, head, initial, next, remove, tail,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (typeof jQuery !== "undefined" && jQuery !== null) {
    jQuery.fn.asEventStream = function(eventName) {
      var element;
      element = this;
      return new EventStream(function(sink) {
        var handler;
        handler = function(event) {
          return sink(next(event));
        };
        element.bind(eventName, handler);
        return function() {
          return element.unbind(eventName, handler);
        };
      });
    };
  }

  Bacon = this.Bacon = {
    taste: "delicious"
  };

  Bacon.noMore = "veggies";

  Bacon.more = "moar bacon!";

  Bacon.later = function(delay, value) {
    return new EventStream((function(sink) {
      var push;
      push = function() {
        sink(next(value));
        return sink(end());
      };
      return setTimeout(push(delay));
    }));
  };

  Bacon.sequentially = function(delay, values) {
    return new EventStream((function(sink) {
      var push, schedule;
      schedule = function(xs) {
        if (empty(xs)) {
          return sink(end());
        } else {
          return setTimeout((function() {
            return push(xs);
          }), delay);
        }
      };
      push = function(xs) {
        var reply;
        reply = sink(next(head(xs)));
        if (reply !== Bacon.noMore) return schedule(tail(xs));
      };
      return schedule(values);
    }));
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

    return Initial;

  })(Next);

  End = (function(_super) {

    __extends(End, _super);

    function End() {}

    End.prototype.isEnd = function() {
      return true;
    };

    return End;

  })(Event);

  EventStream = (function() {

    function EventStream(subscribe) {
      this.subscribe = new Dispatcher(subscribe).subscribe;
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

    EventStream.prototype.map = function(f) {
      return this.withHandler(function(event) {
        if (event.isEnd()) {
          return this.push(event);
        } else {
          return this.push(next(f(event.value)));
        }
      });
    };

    EventStream.prototype.merge = function(right) {
      var left;
      left = this;
      return new EventStream(function(sink) {
        var ends, smartSink;
        ends = 0;
        smartSink = function(event) {
          if (event.isEnd()) {
            ends++;
            if (ends === 2) {
              return sink(end());
            } else {
              return Bacon.more;
            }
          } else {
            return sink(event);
          }
        };
        left.subscribe(smartSink);
        return right.subscribe(smartSink);
      });
    };

    EventStream.prototype.toProperty = function(initValue) {
      return new Property(this, initValue);
    };

    EventStream.prototype.withHandler = function(handler) {
      return new Dispatcher(this.subscribe, handler).toEventStream();
    };

    EventStream.prototype.toString = function() {
      return "EventStream";
    };

    return EventStream;

  })();

  Property = (function() {

    function Property(stream, initValue) {
      var currentValue, d, handleEvent;
      currentValue = initValue;
      handleEvent = function(event) {
        if (!event.isEnd) currentValue = event.value;
        return this.push(event);
      };
      d = new Dispatcher(stream.subscribe, handleEvent);
      this.subscribe = function(sink) {
        if (currentValue != null) sink(initial(currentValue));
        return d.subscribe(sink);
      };
    }

    return Property;

  })();

  Dispatcher = (function() {

    function Dispatcher(subscribe, handleEvent) {
      var sinks,
        _this = this;
      if (subscribe == null) subscribe = function(event) {};
      sinks = [];
      this.push = function(event) {
        var reply, sink, _i, _len;
        assertEvent(event);
        for (_i = 0, _len = sinks.length; _i < _len; _i++) {
          sink = sinks[_i];
          reply = sink(event);
          if (reply === Bacon.noMore) remove(sink, sinks);
        }
        if (sinks.length > 0) {
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
        if (sinks.length === 1) return subscribe(_this.handleEvent);
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

}).call(this);
