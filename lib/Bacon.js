(function() {
  var Bacon, Bus, Dispatcher, End, Error, Event, EventStream, Initial, Next, None, Observable, Property, PropertyDispatcher, Some, assert, assertArray, assertEvent, assertFunction, assertString, cloneArray, cloneObject, end, former, initial, isEvent, isFieldKey, isFunction, latter, makeFunction, methodCall, next, nop, partiallyApplied, remove, sendWrapped, toCombinator, toEvent, toFieldExtractor, toFieldKey, toOption, toSimpleExtractor, _, _ref,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = this.jQuery || this.Zepto) != null) {
    _ref.fn.asEventStream = function(eventName, selector, eventTransformer) {
      var element;
      element = this;
      return new EventStream(function(sink) {
        var handler, unbind;
        handler = function(event, data) {
          var reply, valueToStream;
          valueToStream = eventTransformer === void 0 ? event : eventTransformer(event, data);
          reply = sink(next(valueToStream));
          if (reply === Bacon.noMore) return unbind();
        };
        unbind = function() {
          return element.off(eventName, selector, handler);
        };
        element.on(eventName, selector, handler);
        return unbind;
      });
    };
  }

  Bacon = this.Bacon = {};

  Bacon.fromPromise = function(promise) {
    return new Bacon.EventStream(function(sink) {
      var onError, onSuccess;
      onSuccess = function(value) {
        sink(new Next(value));
        return sink(new End);
      };
      onError = function(e) {
        sink(new Error(e));
        return sink(new End);
      };
      promise.then(onSuccess, onError);
      return nop;
    });
  };

  Bacon.noMore = "veggies";

  Bacon.more = "moar bacon!";

  Bacon.later = function(delay, value) {
    return Bacon.sequentially(delay, [value]);
  };

  Bacon.sequentially = function(delay, values) {
    var index, poll;
    index = -1;
    poll = function() {
      index++;
      if (index < values.length) {
        return toEvent(values[index]);
      } else {
        return end();
      }
    };
    return Bacon.fromPoll(delay, poll);
  };

  Bacon.repeatedly = function(delay, values) {
    var index, poll;
    index = -1;
    poll = function() {
      index++;
      return toEvent(values[index % values.length]);
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

  Bacon.fromEventTarget = function(target, eventName) {
    return new EventStream(function(sink) {
      var handler, unbind;
      handler = function(event) {
        var reply;
        reply = sink(next(event));
        if (reply === Bacon.noMore) return unbind();
      };
      if (target.addEventListener) {
        unbind = function() {
          return target.removeEventListener(eventName, handler, false);
        };
        target.addEventListener(eventName, handler, false);
      } else {
        unbind = function() {
          return target.removeListener(eventName, handler);
        };
        target.addListener(eventName, handler);
      }
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

  Bacon.constant = function(value) {
    return new Property(sendWrapped([value], initial));
  };

  Bacon.never = function() {
    return Bacon.fromArray([]);
  };

  Bacon.once = function(value) {
    return Bacon.fromArray([value]);
  };

  Bacon.fromArray = function(values) {
    return new EventStream(sendWrapped(values, next));
  };

  sendWrapped = function(values, wrapper) {
    return function(sink) {
      var value, _i, _len;
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        sink(wrapper(value));
      }
      sink(end());
      return nop;
    };
  };

  Bacon.combineAll = function(streams, f) {
    var next, stream, _i, _len, _ref2;
    assertArray(streams);
    stream = _.head(streams);
    _ref2 = _.tail(streams);
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

  Bacon.combineAsArray = function() {
    var more, next, stream, streams, _i, _len, _ref2;
    streams = arguments[0], more = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!(streams instanceof Array)) streams = [streams].concat(more);
    stream = (_.head(streams)).toProperty().map(function(x) {
      return [x];
    });
    _ref2 = _.tail(streams);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      next = _ref2[_i];
      stream = stream.combine(next, function(xs, x) {
        return xs.concat([x]);
      });
    }
    return stream;
  };

  Bacon.combineWith = function(streams, f) {
    return Bacon.combineAll(streams, function(s1, s2) {
      return s1.toProperty().combine(s2, f);
    });
  };

  Bacon.combineTemplate = function(template) {
    var applyStreamValue, combinator, compileTemplate, constantValue, current, funcs, setValue, streams;
    funcs = [];
    streams = [];
    current = function(ctxStack) {
      return ctxStack[ctxStack.length - 1];
    };
    setValue = function(ctxStack, key, value) {
      return current(ctxStack)[key] = value;
    };
    applyStreamValue = function(key, index) {
      return function(ctxStack, values) {
        return setValue(ctxStack, key, values[index]);
      };
    };
    constantValue = function(key, value) {
      return function(ctxStack, values) {
        return setValue(ctxStack, key, value);
      };
    };
    compileTemplate = function(template) {
      var key, popContext, pushContext, value, _results;
      _results = [];
      for (key in template) {
        value = template[key];
        if (value instanceof Observable) {
          streams.push(value);
          _results.push(funcs.push(applyStreamValue(key, streams.length - 1)));
        } else if (typeof value === "object") {
          pushContext = function(key) {
            return function(ctxStack, values) {
              var newContext;
              newContext = {};
              setValue(ctxStack, key, newContext);
              return ctxStack.push(newContext);
            };
          };
          popContext = function(ctxStack, values) {
            return ctxStack.pop();
          };
          funcs.push(pushContext(key));
          compileTemplate(value);
          _results.push(funcs.push(popContext));
        } else {
          _results.push(funcs.push(constantValue(key, value)));
        }
      }
      return _results;
    };
    compileTemplate(template);
    combinator = function(values) {
      var ctxStack, f, rootContext, _i, _len;
      rootContext = {};
      ctxStack = [rootContext];
      for (_i = 0, _len = funcs.length; _i < _len; _i++) {
        f = funcs[_i];
        f(ctxStack, values);
      }
      return rootContext;
    };
    return Bacon.combineAsArray(streams).map(combinator);
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

    Event.prototype.isError = function() {
      return false;
    };

    Event.prototype.hasValue = function() {
      return false;
    };

    Event.prototype.filter = function(f) {
      return true;
    };

    Event.prototype.getOriginalEvent = function() {
      if (this.sourceEvent != null) {
        return this.sourceEvent.getOriginalEvent();
      } else {
        return this;
      }
    };

    Event.prototype.onDone = function(listener) {
      return listener();
    };

    return Event;

  })();

  Next = (function(_super) {

    __extends(Next, _super);

    function Next(value, sourceEvent) {
      this.value = value;
    }

    Next.prototype.isNext = function() {
      return true;
    };

    Next.prototype.hasValue = function() {
      return true;
    };

    Next.prototype.fmap = function(f) {
      return this.apply(f(this.value));
    };

    Next.prototype.apply = function(value) {
      return next(value, this.getOriginalEvent());
    };

    Next.prototype.filter = function(f) {
      return f(this.value);
    };

    Next.prototype.describe = function() {
      return this.value;
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

    Initial.prototype.apply = function(value) {
      return initial(value, this.getOriginalEvent());
    };

    return Initial;

  })(Next);

  End = (function(_super) {

    __extends(End, _super);

    function End() {
      End.__super__.constructor.apply(this, arguments);
    }

    End.prototype.isEnd = function() {
      return true;
    };

    End.prototype.fmap = function() {
      return this;
    };

    End.prototype.apply = function() {
      return this;
    };

    End.prototype.describe = function() {
      return "<end>";
    };

    return End;

  })(Event);

  Error = (function(_super) {

    __extends(Error, _super);

    function Error(error) {
      this.error = error;
    }

    Error.prototype.isError = function() {
      return true;
    };

    Error.prototype.fmap = function() {
      return this;
    };

    Error.prototype.apply = function() {
      return this;
    };

    Error.prototype.describe = function() {
      return "<error> " + this.error;
    };

    return Error;

  })(Event);

  Observable = (function() {

    function Observable() {
      this["switch"] = __bind(this["switch"], this);
      this.takeUntil = __bind(this.takeUntil, this);      this.assign = this.onValue;
    }

    Observable.prototype.onValue = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.subscribe(function(event) {
        if (event.hasValue()) return f(event.value);
      });
    };

    Observable.prototype.onValues = function(f) {
      return this.onValue(function(args) {
        return f.apply(null, args);
      });
    };

    Observable.prototype.onError = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.subscribe(function(event) {
        if (event.isError()) return f(event.error);
      });
    };

    Observable.prototype.onEnd = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.subscribe(function(event) {
        if (event.isEnd()) return f();
      });
    };

    Observable.prototype.errors = function() {
      return this.filter(function() {
        return false;
      });
    };

    Observable.prototype.filter = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          return Bacon.more;
        }
      });
    };

    Observable.prototype.takeWhile = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          this.push(end());
          return Bacon.noMore;
        }
      });
    };

    Observable.prototype.endOnError = function() {
      return this.withHandler(function(event) {
        if (event.isError()) {
          this.push(event);
          return this.push(end());
        } else {
          return this.push(event);
        }
      });
    };

    Observable.prototype.take = function(count) {
      assert("take: count must >= 1", count >= 1);
      return this.withHandler(function(event) {
        if (!event.hasValue()) {
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

    Observable.prototype.map = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.withHandler(function(event) {
        return this.push(event.fmap(f));
      });
    };

    Observable.prototype.mapError = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.withHandler(function(event) {
        if (event.isError()) {
          return this.push(next(f(event.error)));
        } else {
          return this.push(event);
        }
      });
    };

    Observable.prototype["do"] = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.withHandler(function(event) {
        if (event.hasValue()) f(event.value);
        return this.push(event);
      });
    };

    Observable.prototype.takeUntil = function(stopper) {
      var src;
      src = this;
      return this.withSubscribe(function(sink) {
        var srcSink, stopperSink, unsubBoth, unsubSrc, unsubStopper, unsubscribed;
        unsubscribed = false;
        unsubSrc = nop;
        unsubStopper = nop;
        unsubBoth = function() {
          unsubSrc();
          unsubStopper();
          return unsubscribed = true;
        };
        srcSink = function(event) {
          if (event.isEnd()) {
            unsubStopper();
            sink(event);
            return Bacon.noMore;
          } else {
            event.getOriginalEvent().onDone(function() {
              var reply;
              if (!unsubscribed) {
                reply = sink(event);
                if (reply === Bacon.noMore) return unsubBoth();
              }
            });
            return Bacon.more;
          }
        };
        stopperSink = function(event) {
          if (event.isError()) {
            return Bacon.more;
          } else if (event.isEnd()) {
            return Bacon.noMore;
          } else {
            unsubSrc();
            sink(end());
            return Bacon.noMore;
          }
        };
        unsubSrc = src.subscribe(srcSink);
        if (!unsubscribed) unsubStopper = stopper.subscribe(stopperSink);
        return unsubBoth;
      });
    };

    Observable.prototype.skip = function(count) {
      assert("skip: count must >= 0", count >= 0);
      return this.withHandler(function(event) {
        if (!event.hasValue()) {
          return this.push(event);
        } else if (count > 0) {
          count--;
          return Bacon.more;
        } else {
          return this.push(event);
        }
      });
    };

    Observable.prototype.distinctUntilChanged = function() {
      return this.skipDuplicates();
    };

    Observable.prototype.skipDuplicates = function() {
      return this.withStateMachine(void 0, function(prev, event) {
        if (!event.hasValue()) {
          return [prev, [event]];
        } else if (prev !== event.value) {
          return [event.value, [event]];
        } else {
          return [prev, []];
        }
      });
    };

    Observable.prototype.withStateMachine = function(initState, f) {
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

    Observable.prototype.flatMap = function(f) {
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
          var child, childEnded, handler, removeChild, unsubChild;
          if (event.isEnd()) {
            rootEnd = true;
            return checkEnd();
          } else if (event.isError()) {
            return sink(event);
          } else {
            child = f(event.value);
            unsubChild = void 0;
            childEnded = false;
            removeChild = function() {
              if (unsubChild != null) remove(unsubChild, children);
              return checkEnd();
            };
            handler = function(event) {
              var reply;
              if (event.isEnd()) {
                removeChild();
                childEnded = true;
                return Bacon.noMore;
              } else {
                reply = sink(event);
                if (reply === Bacon.noMore) unbind();
                return reply;
              }
            };
            unsubChild = child.subscribe(handler);
            if (!childEnded) return children.push(unsubChild);
          }
        };
        unsubRoot = root.subscribe(spawner);
        return unbind;
      });
    };

    Observable.prototype["switch"] = function(f) {
      var stream,
        _this = this;
      stream = this.toEventStream();
      return stream.flatMap(function(value) {
        return f(value).takeUntil(stream);
      });
    };

    Observable.prototype.not = function() {
      return this.map(function(x) {
        return !x;
      });
    };

    Observable.prototype.log = function() {
      this.subscribe(function(event) {
        return console.log(event.describe());
      });
      return;
    };

    return Observable;

  })();

  EventStream = (function(_super) {

    __extends(EventStream, _super);

    function EventStream(subscribe) {
      var dispatcher;
      EventStream.__super__.constructor.call(this);
      assertFunction(subscribe);
      dispatcher = new Dispatcher(subscribe);
      this.subscribe = dispatcher.subscribe;
      this.hasSubscribers = dispatcher.hasSubscribers;
    }

    EventStream.prototype.map = function() {
      var args, p;
      p = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (p instanceof Property) {
        return p.sampledBy(this, former);
      } else {
        return EventStream.__super__.map.apply(this, [p].concat(__slice.call(args)));
      }
    };

    EventStream.prototype.filter = function() {
      var args, p;
      p = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (p instanceof Property) {
        return p.sampledBy(this, function(p, s) {
          return [p, s];
        }).filter(function(_arg) {
          var p, s;
          p = _arg[0], s = _arg[1];
          return p;
        }).map(function(_arg) {
          var p, s;
          p = _arg[0], s = _arg[1];
          return s;
        });
      } else {
        return EventStream.__super__.filter.apply(this, [p].concat(__slice.call(args)));
      }
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
          _this.push(next(values, event));
          return values = [];
        };
        if (event.isError()) {
          return this.push(event);
        } else if (event.isEnd()) {
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
        var ends, smartSink, unsubBoth, unsubLeft, unsubRight, unsubscribed;
        unsubLeft = nop;
        unsubRight = nop;
        unsubscribed = false;
        unsubBoth = function() {
          unsubLeft();
          unsubRight();
          return unsubscribed = true;
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
        if (!unsubscribed) unsubRight = right.subscribe(smartSink);
        return unsubBoth;
      });
    };

    EventStream.prototype.toProperty = function(initValue) {
      if (arguments.length === 0) initValue = None;
      return this.scan(initValue, latter);
    };

    EventStream.prototype.toEventStream = function() {
      return this;
    };

    EventStream.prototype.scan = function(seed, f) {
      var acc, d, handleEvent, subscribe;
      acc = toOption(seed);
      f = toCombinator(f);
      handleEvent = function(event) {
        if (event.hasValue()) {
          acc = new Some(f(acc.getOrElse(void 0), event.value));
        }
        return this.push(event.apply(acc.getOrElse(void 0)));
      };
      d = new Dispatcher(this.subscribe, handleEvent);
      subscribe = function(sink) {
        var reply;
        reply = acc.map(function(val) {
          return sink(initial(val));
        }).getOrElse(Bacon.more);
        if (reply !== Bacon.noMore) return d.subscribe(sink);
      };
      return new Property(subscribe);
    };

    EventStream.prototype.concat = function(right) {
      var left;
      left = this;
      return new EventStream(function(sink) {
        var unsub;
        unsub = left.subscribe(function(e) {
          if (e.isEnd()) {
            return unsub = right.subscribe(sink);
          } else {
            return sink(e);
          }
        });
        return function() {
          return unsub();
        };
      });
    };

    EventStream.prototype.startWith = function(seed) {
      return Bacon.once(seed).concat(this);
    };

    EventStream.prototype.decorateWith = function(label, property) {
      return property.sampledBy(this, function(propertyValue, streamValue) {
        var result;
        result = cloneObject(streamValue);
        result[label] = propertyValue;
        return result;
      });
    };

    EventStream.prototype.mapEnd = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = makeFunction(f, args);
      return this.withHandler(function(event) {
        if (event.isEnd()) {
          this.push(next(f(event)));
          this.push(end());
          return Bacon.noMore;
        } else {
          return this.push(event);
        }
      });
    };

    EventStream.prototype.withHandler = function(handler) {
      var dispatcher;
      dispatcher = new Dispatcher(this.subscribe, handler);
      return new EventStream(dispatcher.subscribe);
    };

    EventStream.prototype.withSubscribe = function(subscribe) {
      return new EventStream(subscribe);
    };

    return EventStream;

  })(Observable);

  Property = (function(_super) {

    __extends(Property, _super);

    function Property(subscribe) {
      var combine,
        _this = this;
      this.subscribe = subscribe;
      this.toEventStream = __bind(this.toEventStream, this);
      this.toProperty = __bind(this.toProperty, this);
      this.changes = __bind(this.changes, this);
      this.sample = __bind(this.sample, this);
      Property.__super__.constructor.call(this);
      combine = function(other, leftSink, rightSink) {
        var myVal, otherVal;
        myVal = None;
        otherVal = None;
        return new Property(function(sink) {
          var checkEnd, combiningSink, initialSent, myEnd, mySink, otherEnd, otherSink, unsubBoth, unsubMe, unsubOther, unsubscribed;
          unsubscribed = false;
          unsubMe = nop;
          unsubOther = nop;
          unsubBoth = function() {
            unsubMe();
            unsubOther();
            return unsubscribed = true;
          };
          myEnd = false;
          otherEnd = false;
          checkEnd = function() {
            var reply;
            if (myEnd && otherEnd) {
              reply = sink(end());
              if (reply === Bacon.noMore) unsubBoth();
              return reply;
            }
          };
          initialSent = false;
          combiningSink = function(markEnd, setValue, thisSink) {
            return function(event) {
              var reply;
              if (event.isEnd()) {
                markEnd();
                checkEnd();
                return Bacon.noMore;
              } else if (event.isError()) {
                reply = sink(event);
                if (reply === Bacon.noMore) unsubBoth();
                return reply;
              } else {
                setValue(new Some(event.value));
                if (myVal.isDefined && otherVal.isDefined) {
                  if (initialSent && event.isInitial()) {
                    return Bacon.more;
                  } else {
                    initialSent = true;
                    reply = thisSink(sink, event, myVal.value, otherVal.value);
                    if (reply === Bacon.noMore) unsubBoth();
                    return reply;
                  }
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
          if (!unsubscribed) unsubOther = other.subscribe(otherSink);
          return unsubBoth;
        });
      };
      this.combine = function(other, f) {
        var combinator, combineAndPush;
        combinator = toCombinator(f);
        combineAndPush = function(sink, event, myVal, otherVal) {
          return sink(event.apply(combinator(myVal, otherVal)));
        };
        return combine(other, combineAndPush, combineAndPush);
      };
      this.sampledBy = function(sampler, combinator) {
        var pushPropertyValue;
        if (combinator == null) combinator = former;
        combinator = toCombinator(combinator);
        pushPropertyValue = function(sink, event, propertyVal, streamVal) {
          return sink(event.apply(combinator(propertyVal, streamVal)));
        };
        return combine(sampler, nop, pushPropertyValue).changes().takeUntil(sampler.filter(false).mapEnd());
      };
    }

    Property.prototype.sample = function(interval) {
      return this.sampledBy(Bacon.interval(interval, {}));
    };

    Property.prototype.changes = function() {
      var _this = this;
      return new EventStream(function(sink) {
        return _this.subscribe(function(event) {
          if (!event.isInitial()) return sink(event);
        });
      });
    };

    Property.prototype.withHandler = function(handler) {
      return new Property(new PropertyDispatcher(this.subscribe, handler).subscribe);
    };

    Property.prototype.withSubscribe = function(subscribe) {
      return new Property(new PropertyDispatcher(subscribe).subscribe);
    };

    Property.prototype.toProperty = function() {
      return this;
    };

    Property.prototype.toEventStream = function() {
      var _this = this;
      return new EventStream(function(sink) {
        return _this.subscribe(function(event) {
          if (event.isInitial()) event = next(event.value);
          return sink(event);
        });
      });
    };

    Property.prototype.and = function(other) {
      return this.combine(other, function(x, y) {
        return x && y;
      });
    };

    Property.prototype.or = function(other) {
      return this.combine(other, function(x, y) {
        return x || y;
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
        var done, reply, sink, waiters, _i, _len, _ref2;
        waiters = void 0;
        done = function() {
          var w, ws, _i, _len;
          if (waiters != null) {
            ws = waiters;
            waiters = void 0;
            for (_i = 0, _len = ws.length; _i < _len; _i++) {
              w = ws[_i];
              w();
            }
          }
          return event.onDone = Event.prototype.onDone;
        };
        event.onDone = function(listener) {
          if ((waiters != null) && !_.contains(waiters, listener)) {
            return waiters.push(listener);
          } else {
            return waiters = [listener];
          }
        };
        assertEvent(event);
        _ref2 = cloneArray(sinks);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          sink = _ref2[_i];
          reply = sink(event);
          if (reply === Bacon.noMore || event.isEnd()) removeSink(sink);
        }
        done();
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
        if (event.isEnd()) {
          subscribe = function() {
            return nop;
          };
        }
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

    return Dispatcher;

  })();

  PropertyDispatcher = (function(_super) {

    __extends(PropertyDispatcher, _super);

    function PropertyDispatcher(subscribe, handleEvent) {
      var current, push,
        _this = this;
      PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
      current = None;
      push = this.push;
      subscribe = this.subscribe;
      this.push = function(event) {
        if (event.hasValue()) current = new Some(event.value);
        return push.apply(_this, [event]);
      };
      this.subscribe = function(sink) {
        var reply;
        reply = current.filter(_this.hasSubscribers).map(function(val) {
          return sink(initial(val));
        });
        if (reply.getOrElse(Bacon.more) === Bacon.noMore) {
          return nop;
        } else {
          return subscribe.apply(_this, [sink]);
        }
      };
    }

    return PropertyDispatcher;

  })(Dispatcher);

  Bus = (function(_super) {

    __extends(Bus, _super);

    function Bus() {
      var dispatcher, ended, guardedSink, inputs, sink, subscribeAll, subscribeThis, unsubAll, unsubFuncs,
        _this = this;
      sink = void 0;
      unsubFuncs = [];
      inputs = [];
      ended = false;
      guardedSink = function(input) {
        return function(event) {
          if (event.isEnd()) {
            remove(input, inputs);
            return Bacon.noMore;
          } else {
            return sink(event);
          }
        };
      };
      unsubAll = function() {
        var f, _i, _len;
        for (_i = 0, _len = unsubFuncs.length; _i < _len; _i++) {
          f = unsubFuncs[_i];
          f();
        }
        return unsubFuncs = [];
      };
      subscribeAll = function(newSink) {
        var input, _i, _len, _ref2;
        sink = newSink;
        unsubFuncs = [];
        _ref2 = cloneArray(inputs);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          input = _ref2[_i];
          unsubFuncs.push(input.subscribe(guardedSink(input)));
        }
        return unsubAll;
      };
      dispatcher = new Dispatcher(subscribeAll);
      subscribeThis = function(sink) {
        return dispatcher.subscribe(sink);
      };
      Bus.__super__.constructor.call(this, subscribeThis);
      this.plug = function(inputStream) {
        if (ended) return;
        inputs.push(inputStream);
        if ((sink != null)) {
          return unsubFuncs.push(inputStream.subscribe(guardedSink(inputStream)));
        }
      };
      this.push = function(value) {
        if (sink != null) return sink(next(value));
      };
      this.error = function(error) {
        if (sink != null) return sink(new Error(error));
      };
      this.end = function() {
        ended = true;
        unsubAll();
        if (sink != null) return sink(end());
      };
    }

    return Bus;

  })(EventStream);

  Some = (function() {

    function Some(value) {
      this.value = value;
    }

    Some.prototype.getOrElse = function() {
      return this.value;
    };

    Some.prototype.filter = function(f) {
      if (f(this.value)) {
        return new Some(this.value);
      } else {
        return None;
      }
    };

    Some.prototype.map = function(f) {
      return new Some(f(this.value));
    };

    Some.prototype.isDefined = true;

    return Some;

  })();

  None = {
    getOrElse: function(value) {
      return value;
    },
    filter: function() {
      return None;
    },
    map: function() {
      return None;
    },
    isDefined: false
  };

  Bacon.EventStream = EventStream;

  Bacon.Property = Property;

  Bacon.Observable = Observable;

  Bacon.Bus = Bus;

  Bacon.Initial = Initial;

  Bacon.Next = Next;

  Bacon.End = End;

  Bacon.Error = Error;

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

  isEvent = function(x) {
    return (x != null) && (x.isEvent != null) && x.isEvent();
  };

  toEvent = function(x) {
    if (isEvent(x)) {
      return x;
    } else {
      return next(x);
    }
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
    return assert("not a function : " + f, isFunction(f));
  };

  isFunction = function(f) {
    return typeof f === "function";
  };

  assertArray = function(xs) {
    return assert("not an array : " + xs, xs instanceof Array);
  };

  assertString = function(x) {
    return assert("not a string : " + x, typeof x === "string");
  };

  methodCall = function(obj, method, args) {
    assertString(method);
    if (args === void 0) args = [];
    return function(value) {
      return obj[method].apply(obj, args.concat([value]));
    };
  };

  partiallyApplied = function(f, args) {
    return function(value) {
      return f.apply(null, args.concat([value]));
    };
  };

  makeFunction = function(f, args) {
    if (isFunction(f)) {
      if (args.length) {
        return partiallyApplied(f, args);
      } else {
        return f;
      }
    } else if (isFieldKey(f)) {
      return toFieldExtractor(f, args);
    } else if (typeof f === "object" && args.length) {
      return methodCall(f, _.head(args), _.tail(args));
    } else {
      return _.always(f);
    }
  };

  isFieldKey = function(f) {
    return (typeof f === "string") && f.length > 1 && f[0] === ".";
  };

  toFieldExtractor = function(f, args) {
    var partFuncs, parts;
    parts = f.slice(1).split(".");
    partFuncs = _.map(toSimpleExtractor(args), parts);
    return function(value) {
      var f, _i, _len;
      for (_i = 0, _len = partFuncs.length; _i < _len; _i++) {
        f = partFuncs[_i];
        value = f(value);
      }
      return value;
    };
  };

  toSimpleExtractor = function(args) {
    return function(key) {
      return function(value) {
        var fieldValue;
        fieldValue = value[key];
        if (isFunction(fieldValue)) {
          return fieldValue.apply(null, args);
        } else {
          return fieldValue;
        }
      };
    };
  };

  toFieldKey = function(f) {
    return f.slice(1);
  };

  toCombinator = function(f) {
    var key;
    if (isFunction(f)) {
      return f;
    } else if (isFieldKey(f)) {
      key = toFieldKey(f);
      return function(left, right) {
        return left[key](right);
      };
    } else {
      return assert("not a function or a field key: " + f, false);
    }
  };

  toOption = function(v) {
    if (v instanceof Some || v === None) {
      return v;
    } else {
      return new Some(v);
    }
  };

  if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
    if (typeof define === "function") {
      define(function() {
        return Bacon;
      });
    }
  }

  _ = {
    head: function(xs) {
      return xs[0];
    },
    always: function(x) {
      return function() {
        return x;
      };
    },
    empty: function(xs) {
      return xs.length === 0;
    },
    tail: function(xs) {
      return xs.slice(1, xs.length);
    },
    filter: function(f, xs) {
      var filtered, x, _i, _len;
      filtered = [];
      for (_i = 0, _len = xs.length; _i < _len; _i++) {
        x = xs[_i];
        if (f(x)) filtered.push(x);
      }
      return filtered;
    },
    map: function(f, xs) {
      var x, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = xs.length; _i < _len; _i++) {
        x = xs[_i];
        _results.push(f(x));
      }
      return _results;
    },
    contains: function(xs, x) {
      return xs.indexOf(x) >= 0;
    }
  };

  Bacon._ = _;

}).call(this);
