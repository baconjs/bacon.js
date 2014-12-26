(function(root, factory) {
    if (typeof define === "function" && define.amd) {
      // AMD. Register as an anonymous module.
      define(["exports"], function(exports) {
        factory((root.Bacon = exports));
      });
    } else if (typeof exports === "object") {
      // CommonJS
      factory(exports);
    } else {
      // Browser globals
      factory(root);
    }
  }(this, function(exports) {
    "use strict";(function (global) {
  var polyfill = global.polyfill = {};
  polyfill.extends = function (child, parent) {
    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    child.__proto__ = parent;
  };

  polyfill.classProps = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  polyfill.applyConstructor = function (Constructor, args) {
    var instance = Object.create(Constructor.prototype);

    var result = Constructor.apply(instance, args);

    return result != null && (typeof result == "object" || typeof result == "function") ? result : instance;
  };

  polyfill.taggedTemplateLiteral = function (strings, raw) {
    return Object.defineProperties(strings, {
      raw: {
        value: raw
      }
    });
  };

  polyfill.interopRequire = function (obj) {
    return obj && (obj["default"] || obj);
  };

  polyfill.toArray = function (arr) {
    return Array.isArray(arr) ? arr : Array.from(arr);
  };

  polyfill.objectSpread = function (obj, keys) {
    var target = {};
    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }

    return target;
  };

  polyfill.hasOwn = Object.prototype.hasOwnProperty;
  polyfill.slice = Array.prototype.slice;
})(typeof global === "undefined" ? self : global);var helpersHasProp, helpersIsArray, helpersIsFunction, helpersToString, helpersMap, helpersHelpers, classesObservable, helpersFilter, helpersWithout, helpersException, helpersAssert, helpersAssertFunction, classesEvent, classesEnd, helpersEnd, helpersNop, globalsUpdateBarrier, classesDispatcher, globalsSpys, helpersRegisterObs, helpersAssertEventStream, helpersSlice, helpersWithDescription, classesProperty, helpersIsFieldKey, helpersWithMethodCallSupport, helpersPartiallyApplied, helpersToSimpleExtractor, helpersToFieldExtractor, helpersAlways, helpersMakeFunction, helpersConvertArgsToFunction, helpersId, classesNext, helpersNext, classesEventStream, classesBus, classesInitial, classesError, Bacon;
helpersHasProp = function (exports) {
  exports["default"] = Object.prototype.hasOwnProperty;
  return exports;
}({});
helpersIsArray = function (exports) {
  function isArray(xs) {
    return xs instanceof Array;
  }
  exports["default"] = isArray;
  return exports;
}({});
helpersIsFunction = function (exports) {
  function isFunction(f) {
    return typeof f === "function";
  }
  exports["default"] = isFunction;
  return exports;
}({});
helpersToString = function (exports, _hasProp, _isArray, _isFunction) {
  var hasProp = _hasProp["default"];
  var isArray = _isArray["default"];
  var isFunction = _isFunction["default"];
  var recursionDepth = 0;
  function toString(obj) {
    var ex, internals, key, value;
    try {
      recursionDepth++;
      if (!obj) {
        return "undefined";
      } else if (isFunction(obj)) {
        return "function";
      } else if (isArray(obj)) {
        if (recursionDepth > 5) {
          return "[..]";
        }
        return "[" + _.map(_.toString, obj).toString() + "]";
      } else if ((obj != null ? obj.toString : void 0) != null && obj.toString !== Object.prototype.toString) {
        return obj.toString();
      } else if (typeof obj === "object") {
        if (recursionDepth > 5) {
          return "{..}";
        }
        internals = function () {
          var _results;
          _results = [];
          for (key in obj) {
            if (!hasProp.call(obj, key))
              continue;
            value = function () {
              try {
                return obj[key];
              } catch (_error) {
                ex = _error;
                return ex;
              }
            }();
            _results.push(toString(key) + ":" + toString(value));
          }
          return _results;
        }();
        return "{" + internals + "}";
      } else {
        return obj;
      }
    } finally {
      recursionDepth--;
    }
  }
  exports["default"] = toString;
  return exports;
}({}, helpersHasProp, helpersIsArray, helpersIsFunction);
helpersMap = function (exports) {
  function map(f, xs) {
    var x, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      _results.push(f(x));
    }
    return _results;
  }
  exports["default"] = map;
  return exports;
}({});
helpersHelpers = function (exports, _toString, _map) {
  var toString = _toString["default"];
  var map = _map["default"];
  exports.map = map;
  exports.toString = toString;
  return exports;
}({}, helpersToString, helpersMap);
classesObservable = function (exports) {
  var idCounter = 0;
  var Observable = function Observable() {
    this.id = ++idCounter;  /*    withDescription(desc, this)
                            @initialDesc = @desc*/
  };
  exports["default"] = Observable;
  return exports;
}({});
helpersFilter = function (exports) {
  function without(x, xs) {
    var filtered, _i, _len;
    filtered = [];
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      if (f(x)) {
        filtered.push(x);
      }
    }
    return filtered;
  }
  exports["default"] = without;
  return exports;
}({});
helpersWithout = function (exports, _filter) {
  var filter = _filter["default"];
  function without(x, xs) {
    return filter(function (y) {
      return y !== x;
    }, xs);
  }
  exports["default"] = without;
  return exports;
}({}, helpersFilter);
helpersException = function (exports) {
  exports["default"] = (global ? global : this).Error;
  return exports;
}({});
helpersAssert = function (exports, _Exception) {
  var Exception = _Exception["default"];
  function assert(message, condition) {
    if (!condition) {
      throw new Exception(message);
    }
  }
  exports["default"] = assert;
  return exports;
}({}, helpersException);
helpersAssertFunction = function (exports, _assert) {
  var assert = _assert["default"];
  function assertFunction(f) {
    return assert("not a function : " + f, isFunction(f));
  }
  exports["default"] = assertFunction;
  return exports;
}({}, helpersAssert);
classesEvent = function (exports) {
  var idCounter = 0;
  var Event = function () {
    var Event = function Event() {
      this.id = ++idCounter;
    };
    Event.prototype.isEvent = function () {
      return true;
    };
    Event.prototype.isEnd = function () {
      return false;
    };
    Event.prototype.isInitial = function () {
      return false;
    };
    Event.prototype.isNext = function () {
      return false;
    };
    Event.prototype.isError = function () {
      return false;
    };
    Event.prototype.hasValue = function () {
      return false;
    };
    Event.prototype.filter = function () {
      return true;
    };
    Event.prototype.inspect = function () {
      return this.toString();
    };
    Event.prototype.log = function () {
      return this.toString();
    };
    return Event;
  }();
  exports["default"] = Event;
  return exports;
}({});
classesEnd = function (exports, _Event) {
  var Event = _Event["default"];
  var End = function (Event) {
    var End = function End() {
    };
    polyfill["extends"](End, Event);
    End.prototype.isEnd = function () {
      return true;
    };
    End.prototype.fmap = function () {
      return this;
    };
    End.prototype.apply = function () {
      return this;
    };
    End.prototype.toString = function () {
      return "<end>";
    };
    return End;
  }(Event);
  exports["default"] = End;
  return exports;
}({}, classesEvent);
helpersEnd = function (exports, _classesEnd) {
  var End = _classesEnd["default"];
  function end() {
    return new End();
  }
  exports["default"] = end;
  return exports;
}({}, classesEnd);
helpersNop = function (exports) {
  function nop() {
  }
  exports["default"] = nop;
  return exports;
}({});
globalsUpdateBarrier = function (exports) {
  exports["default"] = function () {
    var rootEvent, waiterObs = [], waiters = {}, afters = [], aftersIndex = 0;
    return {
      afterTransaction: function (f) {
        if (rootEvent) {
          return afters.push(f);
        } else {
          return f();
        }
      },
      whenDoneWith: function (obs, f) {
        var obsWaiters;
        if (rootEvent) {
          obsWaiters = waiters[obs.id];
          if (!obsWaiters) {
            obsWaiters = waiters[obs.id] = [f];
            return waiterObs.push(obs);
          } else {
            return obsWaiters.push(f);
          }
        } else {
          return f();
        }
      },
      flush: function () {
        while (waiterObs.length > 0) {
          flushWaiters(0);
        }
      },
      flushWaiters: function (index) {
        var f, obs, obsId, obsWaiters, _i, _len;
        obs = waiterObs[index];
        obsId = obs.id;
        obsWaiters = waiters[obsId];
        waiterObs.splice(index, 1);
        delete waiters[obsId];
        flushDepsOf(obs);
        for (_i = 0, _len = obsWaiters.length; _i < _len; _i++) {
          f = obsWaiters[_i];
          f();
        }
      },
      flushDepsOf: function (obs) {
        var dep, deps, index, _i, _len;
        deps = obs.internalDeps();
        for (_i = 0, _len = deps.length; _i < _len; _i++) {
          dep = deps[_i];
          flushDepsOf(dep);
          if (waiters[dep.id]) {
            index = _.indexOf(waiterObs, dep);
            flushWaiters(index);
          }
        }
      },
      inTransaction: function (event, context, f, args) {
        var after, result;
        if (rootEvent) {
          return f.apply(context, args);
        } else {
          rootEvent = event;
          try {
            result = f.apply(context, args);
            flush();
          } finally {
            rootEvent = undefined;
            while (aftersIndex < afters.length) {
              after = afters[aftersIndex];
              aftersIndex++;
              after();
            }
            aftersIndex = 0;
            afters = [];
          }
          return result;
        }
      },
      currentEventId: function () {
        if (rootEvent) {
          return rootEvent.id;
        }
      },
      wrappedSubscribe: function (obs, sink) {
        var doUnsub, unsub, unsubd;
        unsubd = false;
        doUnsub = function () {
        };
        unsub = function () {
          unsubd = true;
          return doUnsub();
        };
        doUnsub = obs.dispatcher.subscribe(function (event) {
          return afterTransaction(function () {
            var reply;
            if (!unsubd) {
              reply = sink(event);
              if (reply === Bacon.noMore) {
                return unsub();
              }
            }
          });
        });
        return unsub;
      },
      hasWaiters: function () {
        return waiterObs.length > 0;
      }
    };
  }();
  return exports;
}({});
classesDispatcher = function (exports, _helpersWithout, _helpersAssertFunction, _helpersEnd, _helpersNop, _globalsUpdateBarrier) {
  var without = _helpersWithout["default"];
  var assertFunction = _helpersAssertFunction["default"];
  var end = _helpersEnd["default"];
  var nop = _helpersNop["default"];
  var UpdateBarrier = _globalsUpdateBarrier["default"];
  var Dispatcher = function () {
    var Dispatcher = function Dispatcher(_subscribe, _handleEvent) {
      this._subscribe = _subscribe;
      this._handleEvent = _handleEvent;
      this.subscribe = _subscribe.call(this);
      this.handleEvent = _handleEvent.call(this);
      this.subscriptions = [];
      this.queue = [];
      this.pushing = false;
      this.ended = false;
    };
    Dispatcher.prototype.hasSubscribers = function () {
      return this.subscriptions.length > 0;
    };
    Dispatcher.prototype.removeSub = function (subscription) {
      this.subscriptions = without(subscription, this.subscriptions);
    };
    Dispatcher.prototype.push = function (event) {
      if (event.isEnd()) {
        this.ended = true;
      }
      return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
    };
    Dispatcher.prototype.pushToSubscriptions = function (event) {
      var e, reply, sub, tmp, _i, _len;
      try {
        tmp = this.subscriptions;
        for (_i = 0, _len = tmp.length; _i < _len; _i++) {
          sub = tmp[_i];
          reply = sub.sink(event);
          if (reply === Bacon.noMore || event.isEnd()) {
            this.removeSub(sub);
          }
        }
        return true;
      } catch (_error) {
        e = _error;
        this.pushing = false;
        this.queue = [];
        throw e;
      }
    };
    Dispatcher.prototype.pushIt = function (event) {
      if (!this.pushing) {
        if (event === this.prevError) {
          return;
        }
        if (event.isError()) {
          this.prevError = event;
        }
        this.pushing = true;
        this.pushToSubscriptions(event);
        this.pushing = false;
        while (this.queue.length) {
          event = this.queue.shift();
          this.push(event);
        }
        if (this.hasSubscribers()) {
          return Bacon.more;
        } else {
          this.unsubscribeFromSource();
          return Bacon.noMore;
        }
      } else {
        this.queue.push(event);
        return Bacon.more;
      }
    };
    Dispatcher.prototype.handleEvent = function (event) {
      if (this._handleEvent) {
        return this._handleEvent(event);
      } else {
        return this.push(event);
      }
    };
    Dispatcher.prototype.unsubscribeFromSource = function () {
      if (this.unsubSrc) {
        this.unsubSrc();
      }
      this.unsubSrc = undefined;
    };
    Dispatcher.prototype.subscribe = function (sink) {
      var subscription;
      if (this.ended) {
        sink(end());
        return nop;
      } else {
        assertFunction(sink);
        subscription = { sink: sink };
        this.subscriptions.push(subscription);
        if (this.subscriptions.length === 1) {
          this.unsubSrc = this._subscribe(this.handleEvent);
          assertFunction(this.unsubSrc);
        }
        return function (_this) {
          return function () {
            _this.removeSub(subscription);
            if (!_this.hasSubscribers()) {
              return _this.unsubscribeFromSource();
            }
          };
        }(this);
      }
    };
    return Dispatcher;
  }();
  exports["default"] = Dispatcher;
  return exports;
}({}, helpersWithout, helpersAssertFunction, helpersEnd, helpersNop, globalsUpdateBarrier);
globalsSpys = function (exports) {
  exports["default"] = [];
  return exports;
}({});
helpersRegisterObs = function (exports, _globalsSpys) {
  var spys = _globalsSpys["default"];
  function registerObs(obs) {
    if (spys.length) {
      if (!registerObs.running) {
        try {
          registerObs.running = true;
          for (var _iterator = spys[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
            var spy = _step.value;
            spy(obs);
          }
        } finally {
          delete registerObs.running;
        }
      }
    }
  }
  exports["default"] = registerObs;
  return exports;
}({}, globalsSpys);
helpersAssertEventStream = function (exports, _classesEventStream, _assert) {
  var EventStream = _classesEventStream["default"];
  var assert = _assert["default"];
  function assertEventStream(event) {
    assert("not an EventStream : " + event, !(event instanceof EventStream));
  }
  exports["default"] = assertEventStream;
  return exports;
}({}, classesEventStream, helpersAssert);
helpersSlice = function (exports) {
  exports["default"] = Array.prototype.slice;
  return exports;
}({});
helpersWithDescription = function (exports, _slice) {
  var slice = _slice["default"];
  function withDescription() {
    var desc, obs, _i;
    desc = 2 <= arguments.length ? slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []);
    obs = arguments[_i++];
    return describe.apply(null, desc).apply(obs);
  }
  exports["default"] = withDescription;
  return exports;
}({}, helpersSlice);
classesProperty = function (exports) {
  var Property = function Property() {
  };
  exports["default"] = Property;
  return exports;
}({});
helpersIsFieldKey = function (exports) {
  function isFieldKey(f) {
    return typeof f === "string" && f.length > 1 && f.charAt(0) === ".";
  }
  exports["default"] = isFieldKey;
  return exports;
}({});
helpersWithMethodCallSupport = function (exports, _slice) {
  var slice = _slice["default"];
  function withMethodCallSupport(wrapped) {
    return function () {
      var args = polyfill.slice.call(arguments);
      var context, f, methodName;
      f = arguments[0];
      if (typeof f === "object" && args.length) {
        context = f;
        methodName = args[0];
        f = function () {
          return context[methodName].apply(context, arguments);
        };
        args = args.slice(1);
      }
      return wrapped.apply(null, [f].concat(slice.call(args)));
    };
  }
  exports["default"] = withMethodCallSupport;
  return exports;
}({}, helpersSlice);
helpersPartiallyApplied = function (exports, _slice) {
  var slice = _slice["default"];
  function partiallyApplied(f, applied) {
    return function () {
      var args = polyfill.slice.call(arguments);
      return f.apply(null, applied.concat(args));
    };
  }
  exports["default"] = partiallyApplied;
  return exports;
}({}, helpersSlice);
helpersToSimpleExtractor = function (exports, _isFunction) {
  var isFunction = _isFunction["default"];
  function toSimpleExtractor(args) {
    return function (key) {
      return function (value) {
        var fieldValue;
        if (!value) {
          return;
        } else {
          fieldValue = value[key];
          if (isFunction(fieldValue)) {
            return fieldValue.apply(value, args);
          } else {
            return fieldValue;
          }
        }
      };
    };
  }
  exports["default"] = toSimpleExtractor;
  return exports;
}({}, helpersIsFunction);
helpersToFieldExtractor = function (exports, _map, _toSimpleExtractor) {
  var map = _map["default"];
  var toSimpleExtractor = _toSimpleExtractor["default"];
  function toFieldExtractor(f, args) {
    var partFuncs, parts;
    parts = f.slice(1).split(".");
    partFuncs = map(toSimpleExtractor(args), parts);
    return function (value) {
      var _i, _len;
      for (_i = 0, _len = partFuncs.length; _i < _len; _i++) {
        f = partFuncs[_i];
        value = f(value);
      }
      return value;
    };
  }
  exports["default"] = toFieldExtractor;
  return exports;
}({}, helpersMap, helpersToSimpleExtractor);
helpersAlways = function (exports) {
  function always(x) {
    return function () {
      return x;
    };
  }
  exports["default"] = always;
  return exports;
}({});
helpersMakeFunction = function (exports, _isFunction, _isFieldKey, _slice, _withMethodCallSupport, _partiallyApplied, _toFieldExtractor, _always) {
  var isFunction = _isFunction["default"];
  var isFieldKey = _isFieldKey["default"];
  var slice = _slice["default"];
  var withMethodCallSupport = _withMethodCallSupport["default"];
  var partiallyApplied = _partiallyApplied["default"];
  var toFieldExtractor = _toFieldExtractor["default"];
  var always = _always["default"];
  exports["default"] = withMethodCallSupport(function () {
    var args, f;
    f = arguments[0];
    args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (isFunction(f)) {
      if (args.length) {
        return partiallyApplied(f, args);
      } else {
        return f;
      }
    } else if (isFieldKey(f)) {
      return toFieldExtractor(f, args);
    } else {
      return always(f);
    }
  });
  return exports;
}({}, helpersIsFunction, helpersIsFieldKey, helpersSlice, helpersWithMethodCallSupport, helpersPartiallyApplied, helpersToFieldExtractor, helpersAlways);
helpersConvertArgsToFunction = function (exports, _classesProperty, _makeFunction) {
  var Property = _classesProperty["default"];
  var makeFunction = _makeFunction["default"];
  function convertArgsToFunction(obs, f, args, method) {
    var sampled;
    if (f instanceof Property) {
      sampled = f.sampledBy(obs, function (p, s) {
        return [
          p,
          s
        ];
      });
      method.call(sampled, function (_ref) {
        var _ref2 = polyfill.toArray(_ref);
        var p = _ref2[0];
        var s = _ref2[1];
        return p;
      }).map(function (_ref3) {
        var _ref4 = polyfill.toArray(_ref3);
        var p = _ref4[0];
        var s = _ref4[1];
        return s;
      });
    } else {
      f = makeFunction(f, args);
      method.call(obs, f);
    }
  }
  exports["default"] = convertArgsToFunction;
  return exports;
}({}, classesProperty, helpersMakeFunction);
helpersId = function (exports) {
  function id(x) {
    return x;
  }
  exports["default"] = id;
  return exports;
}({});
classesNext = function (exports, _Event, _Next, _helpersIsFunction, _helpersToString) {
  var Event = _Event["default"];
  var Next = _Next["default"];
  var isFunction = _helpersIsFunction["default"];
  var toString = _helpersToString["default"];
  var Next = function (Event) {
    var Next = function Next(valueF, eager) {
      Event.call(this);
      if (!eager && isFunction(valueF) || valueF instanceof Next) {
        this.valueF = valueF;
      } else {
        this.valueInternal = valueF;
      }
    };
    polyfill["extends"](Next, Event);
    Next.prototype.isNext = function () {
      return true;
    };
    Next.prototype.hasValue = function () {
      return true;
    };
    Next.prototype.value = function () {
      if (this.valueF instanceof Next) {
        this.valueInternal = this.valueF.value();
      } else if (this.valueF) {
        this.valueInternal = this.valueF();
      }
      return this.valueInternal;
    };
    Next.prototype.apply = function (value) {
      return new Next(value);
    };
    Next.prototype.filter = function (f) {
      return f(this.value());
    };
    Next.prototype.toString = function () {
      return toString(this.value());
    };
    Next.prototype.log = function () {
      return this.value();
    };
    return Next;
  }(Event);
  exports["default"] = Next;
  return exports;
}({}, classesEvent, classesNext, helpersIsFunction, helpersToString);
helpersNext = function (exports, _classesNext) {
  var Next = _classesNext["default"];
  function next() {
    return new Next();
  }
  exports["default"] = next;
  return exports;
}({}, classesNext);
classesEventStream = function (exports, _Observable, _Dispatcher, _helpersRegisterObs, _helpersIsFunction, _helpersAssertFunction, _helpersAssertEventStream, _helpersWithDescription, _helpersConvertArgsToFunction, _helpersId, _helpersNop, _helpersNext) {
  var Observable = _Observable["default"];
  var Dispatcher = _Dispatcher["default"];
  var registerObs = _helpersRegisterObs["default"];
  var isFunction = _helpersIsFunction["default"];
  var assertFunction = _helpersAssertFunction["default"];
  var assertEventStream = _helpersAssertEventStream["default"];
  var withDescription = _helpersWithDescription["default"];
  var convertArgsToFunction = _helpersConvertArgsToFunction["default"];
  var id = _helpersId["default"];
  var nop = _helpersNop["default"];
  var next = _helpersNext["default"];
  var idCounter = 0;
  var EventStream = function (Observable) {
    var EventStream = function EventStream(desc, subscribe, handler) {
      if (isFunction(desc)) {
        handler = subscribe;
        subscribe = desc;
        desc = [];
      }
      Observable.call(this, desc);
      assertFunction(subscribe);
      this.dispatcher = new Dispatcher(subscribe, handler);
      registerObs(this);
    };
    polyfill["extends"](EventStream, Observable);
    EventStream.prototype.delay = function (delay) {
      return withDescription(this, "delay", delay, this.flatMap(function (value) {
        return Bacon.later(delay, value);
      }));
    };
    EventStream.prototype.debounce = function (delay) {
      return withDescription(this, "debounce", delay, this.flatMapLatest(function (value) {
        return Bacon.later(delay, value);
      }));
    };
    EventStream.prototype.debounceImmediate = function (delay) {
      return withDescription(this, "debounceImmediate", delay, this.flatMapFirst(function (value) {
        return Bacon.once(value).concat(Bacon.later(delay).filter(false));
      }));
    };
    EventStream.prototype.throttle = function (delay) {
      return withDescription(this, "throttle", delay, this.bufferWithTime(delay).map(function (values) {
        return values[values.length - 1];
      }));
    };
    EventStream.prototype.bufferWithTime = function (delay) {
      return withDescription(this, "bufferWithTime", delay, this.bufferWithTimeOrCount(delay, Number.MAX_VALUE));
    };
    EventStream.prototype.bufferWithCount = function (count) {
      return withDescription(this, "bufferWithCount", count, this.bufferWithTimeOrCount(void 0, count));
    };
    EventStream.prototype.bufferWithTimeOrCount = function (delay, count) {
      var flushOrSchedule;
      flushOrSchedule = function (buffer) {
        if (buffer.values.length === count) {
          return buffer.flush();
        } else if (delay !== void 0) {
          return buffer.schedule();
        }
      };
      return withDescription(this, "bufferWithTimeOrCount", delay, count, this.buffer(delay, flushOrSchedule, flushOrSchedule));
    };
    EventStream.prototype.buffer = function (delay, onInput, onFlush) {
      var _this = this;
      if (onInput === undefined)
        onInput = nop;
      if (onFlush === undefined)
        onFlush = nop;
      return function () {
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
          flush: function () {
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
          schedule: function () {
            if (!this.scheduled) {
              this.scheduled = true;
              return delay(function (_this) {
                return function () {
                  return _this.flush();
                };
              }(this));
            }
          }
        };
        reply = Bacon.more;
        if (!isFunction(delay)) {
          delayMs = delay;
          delay = function (f) {
            return Bacon.scheduler.setTimeout(f, delayMs);
          };
        }
        return withDescription(_this, "buffer", _this.withHandler(function (event) {
          buffer.push = function (_this) {
            return function (event) {
              return _this.push(event);
            };
          }(this);
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
      }();
    };
    EventStream.prototype.merge = function (right) {
      var left;
      assertEventStream(right);
      left = this;
      return withDescription(left, "merge", right, Bacon.mergeAll(this, right));
    };
    EventStream.prototype.toProperty = function (initValue_) {
      var disp, initValue;
      initValue = arguments.length === 0 ? None : toOption(function () {
        return initValue_;
      });
      disp = this.dispatcher;
      return new Property(describe(this, "toProperty", initValue_), function (sink) {
        var initSent, reply, sendInit, unsub;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function () {
          if (!initSent) {
            return initValue.forEach(function (value) {
              initSent = true;
              reply = sink(new Initial(value));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = disp.subscribe(function (event) {
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
    };
    EventStream.prototype.toEventStream = function () {
      return this;
    };
    EventStream.prototype.sampledBy = function (sampler, combinator) {
      return withDescription(this, "sampledBy", sampler, combinator, this.toProperty().sampledBy(sampler, combinator));
    };
    EventStream.prototype.concat = function (right) {
      var left;
      left = this;
      return new EventStream(describe(left, "concat", right), function (sink) {
        var unsubLeft, unsubRight;
        unsubRight = nop;
        unsubLeft = left.dispatcher.subscribe(function (e) {
          if (e.isEnd()) {
            return right.dispatcher.subscribe(sink);
          } else {
            return sink(e);
          }
        });
        return function () {
          unsubLeft();
          return unsubRight();
        };
      });
    };
    EventStream.prototype.takeUntil = function (stopper) {
      var endMarker;
      endMarker = {};
      return withDescription(this, "takeUntil", stopper, Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors()).withHandler(function (event) {
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
    };
    EventStream.prototype.skipUntil = function (starter) {
      var started;
      started = starter.take(1).map(true).toProperty(false);
      return withDescription(this, "skipUntil", starter, this.filter(started));
    };
    EventStream.prototype.skipWhile = function (f) {
      var args = polyfill.slice.call(arguments, 1);
      var ok;
      ok = false;
      return convertArgsToFunction(this, f, args, function (f) {
        return withDescription(this, "skipWhile", f, this.withHandler(function (event) {
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
    };
    EventStream.prototype.holdWhen = function (valve) {
      var putToHold, releaseHold, valve_;
      valve_ = valve.startWith(false);
      releaseHold = valve_.filter(function (x) {
        return !x;
      });
      putToHold = valve_.filter(_.id);
      return withDescription(this, "holdWhen", valve, this.filter(false).merge(valve_.flatMapConcat(function (_this) {
        return function (shouldHold) {
          if (!shouldHold) {
            return _this.takeUntil(putToHold);
          } else {
            return _this.scan([], function (xs, x) {
              return xs.concat(x);
            }).sampledBy(releaseHold).take(1).flatMap(Bacon.fromArray);
          }
        };
      }(this))));
    };
    EventStream.prototype.startWith = function (seed) {
      withDescription(this, "startWith", seed, Bacon.once(seed).concat(this));
    };
    EventStream.prototype.withHandler = function (handler) {
      new EventStream(describe(this, "withHandler", handler), this.dispatcher.subscribe, handler);
    };
    return EventStream;
  }(Observable);
  exports["default"] = EventStream;
  return exports;
}({}, classesObservable, classesDispatcher, helpersRegisterObs, helpersIsFunction, helpersAssertFunction, helpersAssertEventStream, helpersWithDescription, helpersConvertArgsToFunction, helpersId, helpersNop, helpersNext);
classesBus = function (exports) {
  var Bus = function Bus() {
  };
  exports["default"] = Bus;
  return exports;
}({});
classesInitial = function (exports, _Next) {
  var Next = _Next["default"];
  var Initial = function (Next) {
    var Initial = function Initial() {
    };
    polyfill["extends"](Initial, Next);
    Initial.prototype.isInitial = function () {
      return true;
    };
    Initial.prototype.isNext = function () {
      return false;
    };
    Initial.prototype.apply = function (value) {
      return new Initial(value);
    };
    Initial.prototype.toNext = function () {
      return new Next(this);
    };
    return Initial;
  }(Next);
  exports["default"] = Initial;
  return exports;
}({}, classesNext);
classesError = function (exports, _Event, _helpersToString) {
  var Event = _Event["default"];
  var toString = _helpersToString["default"];
  var Error = function (Event) {
    var Error = function Error(error) {
      this.error = error;
    };
    polyfill["extends"](Error, Event);
    Error.prototype.isError = function () {
      return true;
    };
    Error.prototype.fmap = function () {
      return this;
    };
    Error.prototype.apply = function () {
      return this;
    };
    Error.prototype.toString = function () {
      return "<error> " + toString(this.error);
    };
    return Error;
  }(Event);
  exports["default"] = Error;
  return exports;
}({}, classesEvent, helpersToString);
Bacon = function (exports, _helpersHelpers, _classesEventStream, _classesProperty, _classesObservable, _classesBus, _classesInitial, _classesEnd, _classesError) {
  var _ = _helpersHelpers["default"];
  var version = "<version>", toString = "Bacon";
  exports.EventStream = EventStream;
  exports.Property = Property;
  exports.Observable = Observable;
  exports.Bus = Bus;
  exports.Initial = Initial;
  exports.Next = Next;
  exports.End = End;
  exports.Error = Error;
  exports.version = version;
  exports.toString = toString;
  exports._ = _;
  return exports;
}({}, helpersHelpers, classesEventStream, classesProperty, classesObservable, classesBus, classesInitial, classesEnd, classesError);
  exports.Bacon = Bacon;
}));