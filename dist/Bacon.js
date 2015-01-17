(function() {
"use strict";

var Bacon, Exception;

Bacon = {
  toString: function() {
    return "Bacon";
  }
};

Bacon.version = '<version>';

Exception = (typeof global !== "undefined" && global !== null ? global : this).Error;

var recursionDepth, _,
  __hasProp = {}.hasOwnProperty;

_ = {
  indexOf: Array.prototype.indexOf ? function(xs, x) {
    return xs.indexOf(x);
  } : function(xs, x) {
    var i, y, _i, _len;
    for (i = _i = 0, _len = xs.length; _i < _len; i = ++_i) {
      y = xs[i];
      if (x === y) {
        return i;
      }
    }
    return -1;
  },
  indexWhere: function(xs, f) {
    var i, y, _i, _len;
    for (i = _i = 0, _len = xs.length; _i < _len; i = ++_i) {
      y = xs[i];
      if (f(y)) {
        return i;
      }
    }
    return -1;
  },
  head: function(xs) {
    return xs[0];
  },
  always: function(x) {
    return function() {
      return x;
    };
  },
  negate: function(f) {
    return function(x) {
      return !f(x);
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
      if (f(x)) {
        filtered.push(x);
      }
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
  each: function(xs, f) {
    var key, value;
    for (key in xs) {
      value = xs[key];
      f(key, value);
    }
    return void 0;
  },
  toArray: function(xs) {
    if (isArray(xs)) {
      return xs;
    } else {
      return [xs];
    }
  },
  contains: function(xs, x) {
    return _.indexOf(xs, x) !== -1;
  },
  id: function(x) {
    return x;
  },
  last: function(xs) {
    return xs[xs.length - 1];
  },
  all: function(xs, f) {
    var x, _i, _len;
    if (f == null) {
      f = _.id;
    }
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      if (!f(x)) {
        return false;
      }
    }
    return true;
  },
  any: function(xs, f) {
    var x, _i, _len;
    if (f == null) {
      f = _.id;
    }
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      if (f(x)) {
        return true;
      }
    }
    return false;
  },
  without: function(x, xs) {
    return _.filter((function(y) {
      return y !== x;
    }), xs);
  },
  remove: function(x, xs) {
    var i;
    i = _.indexOf(xs, x);
    if (i >= 0) {
      return xs.splice(i, 1);
    }
  },
  fold: function(xs, seed, f) {
    var x, _i, _len;
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      seed = f(seed, x);
    }
    return seed;
  },
  flatMap: function(f, xs) {
    return _.fold(xs, [], (function(ys, x) {
      return ys.concat(f(x));
    }));
  },
  cached: function(f) {
    var value;
    value = None;
    return function() {
      if (value === None) {
        value = f();
        f = void 0;
      }
      return value;
    };
  },
  isFunction: function(f) {
    return typeof f === "function";
  },
  toString: function(obj) {
    var ex, internals, key, value;
    try {
      recursionDepth++;
      if (obj == null) {
        return "undefined";
      } else if (_.isFunction(obj)) {
        return "function";
      } else if (isArray(obj)) {
        if (recursionDepth > 5) {
          return "[..]";
        }
        return "[" + _.map(_.toString, obj).toString() + "]";
      } else if (((obj != null ? obj.toString : void 0) != null) && obj.toString !== Object.prototype.toString) {
        return obj.toString();
      } else if (typeof obj === "object") {
        if (recursionDepth > 5) {
          return "{..}";
        }
        internals = (function() {
          var _results;
          _results = [];
          for (key in obj) {
            if (!__hasProp.call(obj, key)) continue;
            value = (function() {
              try {
                return obj[key];
              } catch (_error) {
                ex = _error;
                return ex;
              }
            })();
            _results.push(_.toString(key) + ":" + _.toString(value));
          }
          return _results;
        })();
        return "{" + internals + "}";
      } else {
        return obj;
      }
    } finally {
      recursionDepth--;
    }
  }
};

recursionDepth = 0;

Bacon._ = _;

var UpdateBarrier;

UpdateBarrier = (function() {
  var afterTransaction, afters, aftersIndex, currentEventId, flush, flushDepsOf, flushWaiters, hasWaiters, inTransaction, rootEvent, waiterObs, waiters, whenDoneWith, wrappedSubscribe;
  rootEvent = void 0;
  waiterObs = [];
  waiters = {};
  afters = [];
  aftersIndex = 0;
  afterTransaction = function(f) {
    if (rootEvent) {
      return afters.push(f);
    } else {
      return f();
    }
  };
  whenDoneWith = function(obs, f) {
    var obsWaiters;
    if (rootEvent) {
      obsWaiters = waiters[obs.id];
      if (obsWaiters == null) {
        obsWaiters = waiters[obs.id] = [f];
        return waiterObs.push(obs);
      } else {
        return obsWaiters.push(f);
      }
    } else {
      return f();
    }
  };
  flush = function() {
    while (waiterObs.length > 0) {
      flushWaiters(0);
    }
    return void 0;
  };
  flushWaiters = function(index) {
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
    return void 0;
  };
  flushDepsOf = function(obs) {
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
    return void 0;
  };
  inTransaction = function(event, context, f, args) {
    var after, result;
    if (rootEvent) {
      return f.apply(context, args);
    } else {
      rootEvent = event;
      try {
        result = f.apply(context, args);
        flush();
      } finally {
        rootEvent = void 0;
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
  };
  currentEventId = function() {
    if (rootEvent) {
      return rootEvent.id;
    } else {
      return void 0;
    }
  };
  wrappedSubscribe = function(obs, sink) {
    var doUnsub, shouldUnsub, unsub, unsubd;
    unsubd = false;
    shouldUnsub = false;
    doUnsub = function() {
      return shouldUnsub = true;
    };
    unsub = function() {
      unsubd = true;
      return doUnsub();
    };
    doUnsub = obs.dispatcher.subscribe(function(event) {
      return afterTransaction(function() {
        var reply;
        if (!unsubd) {
          reply = sink(event);
          if (reply === Bacon.noMore) {
            return unsub();
          }
        }
      });
    });
    if (shouldUnsub) {
      doUnsub();
    }
    return unsub;
  };
  hasWaiters = function() {
    return waiterObs.length > 0;
  };
  return {
    whenDoneWith: whenDoneWith,
    hasWaiters: hasWaiters,
    inTransaction: inTransaction,
    currentEventId: currentEventId,
    wrappedSubscribe: wrappedSubscribe,
    afterTransaction: afterTransaction
  };
})();

var BufferingSource, ConsumingSource, Source,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Source = (function() {
  function Source(obs, sync, lazy) {
    this.obs = obs;
    this.sync = sync;
    this.lazy = lazy != null ? lazy : false;
    this.queue = [];
  }

  Source.prototype.subscribe = function(sink) {
    return this.obs.dispatcher.subscribe(sink);
  };

  Source.prototype.toString = function() {
    return this.obs.toString();
  };

  Source.prototype.markEnded = function() {
    return this.ended = true;
  };

  Source.prototype.consume = function() {
    if (this.lazy) {
      return {
        value: _.always(this.queue[0])
      };
    } else {
      return this.queue[0];
    }
  };

  Source.prototype.push = function(x) {
    return this.queue = [x];
  };

  Source.prototype.mayHave = function() {
    return true;
  };

  Source.prototype.hasAtLeast = function() {
    return this.queue.length;
  };

  Source.prototype.flatten = true;

  return Source;

})();

ConsumingSource = (function(_super) {
  __extends(ConsumingSource, _super);

  function ConsumingSource() {
    return ConsumingSource.__super__.constructor.apply(this, arguments);
  }

  ConsumingSource.prototype.consume = function() {
    return this.queue.shift();
  };

  ConsumingSource.prototype.push = function(x) {
    return this.queue.push(x);
  };

  ConsumingSource.prototype.mayHave = function(c) {
    return !this.ended || this.queue.length >= c;
  };

  ConsumingSource.prototype.hasAtLeast = function(c) {
    return this.queue.length >= c;
  };

  ConsumingSource.prototype.flatten = false;

  return ConsumingSource;

})(Source);

BufferingSource = (function(_super) {
  __extends(BufferingSource, _super);

  function BufferingSource(obs) {
    BufferingSource.__super__.constructor.call(this, obs, true);
  }

  BufferingSource.prototype.consume = function() {
    var values;
    values = this.queue;
    this.queue = [];
    return {
      value: function() {
        return values;
      }
    };
  };

  BufferingSource.prototype.push = function(x) {
    return this.queue.push(x.value());
  };

  BufferingSource.prototype.hasAtLeast = function() {
    return true;
  };

  return BufferingSource;

})(Source);

Source.isTrigger = function(s) {
  if (s instanceof Source) {
    return s.sync;
  } else {
    return s instanceof EventStream;
  }
};

Source.fromObservable = function(s) {
  if (s instanceof Source) {
    return s;
  } else if (s instanceof Property) {
    return new Source(s, false);
  } else {
    return new ConsumingSource(s, true);
  }
};

var Desc, describe, findDeps, withDescription,
  __slice = [].slice;

Desc = (function() {
  function Desc(context, method, args) {
    this.context = context;
    this.method = method;
    this.args = args;
    this.cached = void 0;
  }

  Desc.prototype.deps = function() {
    return this.cached || (this.cached = findDeps([this.context].concat(this.args)));
  };

  Desc.prototype.apply = function(obs) {
    obs.desc = this;
    return obs;
  };

  Desc.prototype.toString = function() {
    return _.toString(this.context) + "." + _.toString(this.method) + "(" + _.map(_.toString, this.args) + ")";
  };

  return Desc;

})();

describe = function() {
  var args, context, method;
  context = arguments[0], method = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
  if ((context || method) instanceof Desc) {
    return context || method;
  } else {
    return new Desc(context, method, args);
  }
};

withDescription = function() {
  var desc, obs, _i;
  desc = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), obs = arguments[_i++];
  return describe.apply(null, desc).apply(obs);
};

findDeps = function(x) {
  if (isArray(x)) {
    return _.flatMap(findDeps, x);
  } else if (isObservable(x)) {
    return [x];
  } else if (x instanceof Source) {
    return [x.obs];
  } else {
    return [];
  }
};

var convertArgsToFunction, isFieldKey, makeFunction, makeFunctionArgs, makeFunction_, partiallyApplied, toCombinator, toFieldExtractor, toFieldKey, toSimpleExtractor, withMethodCallSupport,
  __slice = [].slice;

withMethodCallSupport = function(wrapped) {
  return function() {
    var args, context, f, methodName;
    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (typeof f === "object" && args.length) {
      context = f;
      methodName = args[0];
      f = function() {
        return context[methodName].apply(context, arguments);
      };
      args = args.slice(1);
    }
    return wrapped.apply(null, [f].concat(__slice.call(args)));
  };
};

makeFunctionArgs = function(args) {
  args = Array.prototype.slice.call(args);
  return makeFunction_.apply(null, args);
};

partiallyApplied = function(f, applied) {
  return function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return f.apply(null, applied.concat(args));
  };
};

toSimpleExtractor = function(args) {
  return function(key) {
    return function(value) {
      var fieldValue;
      if (value == null) {
        return void 0;
      } else {
        fieldValue = value[key];
        if (_.isFunction(fieldValue)) {
          return fieldValue.apply(value, args);
        } else {
          return fieldValue;
        }
      }
    };
  };
};

toFieldExtractor = function(f, args) {
  var partFuncs, parts;
  parts = f.slice(1).split(".");
  partFuncs = _.map(toSimpleExtractor(args), parts);
  return function(value) {
    var _i, _len;
    for (_i = 0, _len = partFuncs.length; _i < _len; _i++) {
      f = partFuncs[_i];
      value = f(value);
    }
    return value;
  };
};

isFieldKey = function(f) {
  return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
};

makeFunction_ = withMethodCallSupport(function() {
  var args, f;
  f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (_.isFunction(f)) {
    if (args.length) {
      return partiallyApplied(f, args);
    } else {
      return f;
    }
  } else if (isFieldKey(f)) {
    return toFieldExtractor(f, args);
  } else {
    return _.always(f);
  }
});

makeFunction = function(f, args) {
  return makeFunction_.apply(null, [f].concat(__slice.call(args)));
};

convertArgsToFunction = function(obs, f, args, method) {
  var sampled;
  if (f instanceof Property) {
    sampled = f.sampledBy(obs, function(p, s) {
      return [p, s];
    });
    return method.call(sampled, function(_arg) {
      var p, s;
      p = _arg[0], s = _arg[1];
      return p;
    }).map(function(_arg) {
      var p, s;
      p = _arg[0], s = _arg[1];
      return s;
    });
  } else {
    f = makeFunction(f, args);
    return method.call(obs, f);
  }
};

toCombinator = function(f) {
  var key;
  if (_.isFunction(f)) {
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

toFieldKey = function(f) {
  return f.slice(1);
};

var None, Some, toOption;

Some = (function() {
  function Some(value) {
    this.value = value;
  }

  Some.prototype.getOrElse = function() {
    return this.value;
  };

  Some.prototype.get = function() {
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

  Some.prototype.forEach = function(f) {
    return f(this.value);
  };

  Some.prototype.isDefined = true;

  Some.prototype.toArray = function() {
    return [this.value];
  };

  Some.prototype.inspect = function() {
    return "Some(" + this.value + ")";
  };

  Some.prototype.toString = function() {
    return this.inspect();
  };

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
  forEach: function() {},
  isDefined: false,
  toArray: function() {
    return [];
  },
  inspect: function() {
    return "None";
  },
  toString: function() {
    return this.inspect();
  }
};

toOption = function(v) {
  if (v instanceof Some || v === None) {
    return v;
  } else {
    return new Some(v);
  }
};

var Observable, idCounter, registerObs;

idCounter = 0;

registerObs = function() {};

Observable = (function() {
  function Observable(desc) {
    this.id = ++idCounter;
    withDescription(desc, this);
    this.initialDesc = this.desc;
  }

  Observable.prototype.subscribe = function(sink) {
    return UpdateBarrier.wrappedSubscribe(this, sink);
  };

  Observable.prototype.subscribeInternal = function(sink) {
    return this.dispatcher.subscribe(sink);
  };

  Observable.prototype.onValue = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return this.subscribe(function(event) {
      if (event.hasValue()) {
        return f(event.value());
      }
    });
  };

  Observable.prototype.onValues = function(f) {
    return this.onValue(function(args) {
      return f.apply(null, args);
    });
  };

  Observable.prototype.onError = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return this.subscribe(function(event) {
      if (event.isError()) {
        return f(event.error);
      }
    });
  };

  Observable.prototype.onEnd = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return this.subscribe(function(event) {
      if (event.isEnd()) {
        return f();
      }
    });
  };

  Observable.prototype.errors = function() {
    return withDescription(this, "errors", this.filter(function() {
      return false;
    }));
  };

  Observable.prototype.name = function(name) {
    this._name = name;
    return this;
  };

  Observable.prototype.withDescription = function() {
    return describe.apply(null, arguments).apply(this);
  };

  Observable.prototype.toString = function() {
    if (this._name) {
      return this._name;
    } else {
      return this.desc.toString();
    }
  };

  Observable.prototype.internalDeps = function() {
    return this.initialDesc.deps();
  };

  return Observable;

})();

Observable.prototype.assign = Observable.prototype.onValue;

Observable.prototype.inspect = Observable.prototype.toString;

Bacon.Observable = Observable;

var CompositeUnsubscribe, compositeUnsubscribe,
  __slice = [].slice,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

compositeUnsubscribe = function() {
  var ss;
  ss = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return new CompositeUnsubscribe(ss).unsubscribe;
};

CompositeUnsubscribe = (function() {
  function CompositeUnsubscribe(ss) {
    var s, _i, _len;
    if (ss == null) {
      ss = [];
    }
    this.unsubscribe = __bind(this.unsubscribe, this);
    this.unsubscribed = false;
    this.subscriptions = [];
    this.starting = [];
    for (_i = 0, _len = ss.length; _i < _len; _i++) {
      s = ss[_i];
      this.add(s);
    }
  }

  CompositeUnsubscribe.prototype.add = function(subscription) {
    var ended, unsub, unsubMe;
    if (this.unsubscribed) {
      return;
    }
    ended = false;
    unsub = nop;
    this.starting.push(subscription);
    unsubMe = (function(_this) {
      return function() {
        if (_this.unsubscribed) {
          return;
        }
        ended = true;
        _this.remove(unsub);
        return _.remove(subscription, _this.starting);
      };
    })(this);
    unsub = subscription(this.unsubscribe, unsubMe);
    if (!(this.unsubscribed || ended)) {
      this.subscriptions.push(unsub);
    }
    _.remove(subscription, this.starting);
    return unsub;
  };

  CompositeUnsubscribe.prototype.remove = function(unsub) {
    if (this.unsubscribed) {
      return;
    }
    if ((_.remove(unsub, this.subscriptions)) !== void 0) {
      return unsub();
    }
  };

  CompositeUnsubscribe.prototype.unsubscribe = function() {
    var s, _i, _len, _ref;
    if (this.unsubscribed) {
      return;
    }
    this.unsubscribed = true;
    _ref = this.subscriptions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      s();
    }
    this.subscriptions = [];
    return this.starting = [];
  };

  CompositeUnsubscribe.prototype.count = function() {
    if (this.unsubscribed) {
      return 0;
    }
    return this.subscriptions.length + this.starting.length;
  };

  CompositeUnsubscribe.prototype.empty = function() {
    return this.count() === 0;
  };

  return CompositeUnsubscribe;

})();

Bacon.CompositeUnsubscribe = CompositeUnsubscribe;

var constantToFunction, containsDuplicateDeps,
  __slice = [].slice;

Bacon.when = function() {
  var f, i, index, ix, len, needsBarrier, pat, patSources, pats, patterns, resultStream, s, sources, triggerFound, usage, _i, _j, _len, _len1, _ref;
  if (arguments.length === 0) {
    return Bacon.never();
  }
  len = arguments.length;
  usage = "when: expecting arguments in the form (Observable+,function)+";
  assert(usage, len % 2 === 0);
  sources = [];
  pats = [];
  i = 0;
  patterns = [];
  while (i < len) {
    patterns[i] = arguments[i];
    patterns[i + 1] = arguments[i + 1];
    patSources = _.toArray(arguments[i]);
    f = constantToFunction(arguments[i + 1]);
    pat = {
      f: f,
      ixs: []
    };
    triggerFound = false;
    for (_i = 0, _len = patSources.length; _i < _len; _i++) {
      s = patSources[_i];
      index = _.indexOf(sources, s);
      if (!triggerFound) {
        triggerFound = Source.isTrigger(s);
      }
      if (index < 0) {
        sources.push(s);
        index = sources.length - 1;
      }
      _ref = pat.ixs;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        ix = _ref[_j];
        if (ix.index === index) {
          ix.count++;
        }
      }
      pat.ixs.push({
        index: index,
        count: 1
      });
    }
    assert("At least one EventStream required", triggerFound || (!patSources.length));
    if (patSources.length > 0) {
      pats.push(pat);
    }
    i = i + 2;
  }
  if (!sources.length) {
    return Bacon.never();
  }
  sources = _.map(Source.fromObservable, sources);
  needsBarrier = (_.any(sources, function(s) {
    return s.flatten;
  })) && (containsDuplicateDeps(_.map((function(s) {
    return s.obs;
  }), sources)));
  return resultStream = new EventStream(describe.apply(null, [Bacon, "when"].concat(__slice.call(patterns))), function(sink) {
    var cannotMatch, cannotSync, ends, match, nonFlattened, part, triggers;
    triggers = [];
    ends = false;
    match = function(p) {
      var _k, _len2, _ref1;
      _ref1 = p.ixs;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        i = _ref1[_k];
        if (!sources[i.index].hasAtLeast(i.count)) {
          return false;
        }
      }
      return true;
    };
    cannotSync = function(source) {
      return !source.sync || source.ended;
    };
    cannotMatch = function(p) {
      var _k, _len2, _ref1;
      _ref1 = p.ixs;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        i = _ref1[_k];
        if (!sources[i.index].mayHave(i.count)) {
          return true;
        }
      }
    };
    nonFlattened = function(trigger) {
      return !trigger.source.flatten;
    };
    part = function(source) {
      return function(unsubAll) {
        var flush, flushLater, flushWhileTriggers;
        flushLater = function() {
          return UpdateBarrier.whenDoneWith(resultStream, flush);
        };
        flushWhileTriggers = function() {
          var events, p, reply, trigger, _k, _len2;
          if (triggers.length > 0) {
            reply = Bacon.more;
            trigger = triggers.pop();
            for (_k = 0, _len2 = pats.length; _k < _len2; _k++) {
              p = pats[_k];
              if (match(p)) {
                events = (function() {
                  var _l, _len3, _ref1, _results;
                  _ref1 = p.ixs;
                  _results = [];
                  for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                    i = _ref1[_l];
                    _results.push(sources[i.index].consume());
                  }
                  return _results;
                })();
                reply = sink(trigger.e.apply(function() {
                  var event, values;
                  values = (function() {
                    var _l, _len3, _results;
                    _results = [];
                    for (_l = 0, _len3 = events.length; _l < _len3; _l++) {
                      event = events[_l];
                      _results.push(event.value());
                    }
                    return _results;
                  })();
                  return p.f.apply(p, values);
                }));
                if (triggers.length) {
                  triggers = _.filter(nonFlattened, triggers);
                }
                if (reply === Bacon.noMore) {
                  return reply;
                } else {
                  return flushWhileTriggers();
                }
              }
            }
          } else {
            return Bacon.more;
          }
        };
        flush = function() {
          var reply;
          reply = flushWhileTriggers();
          if (ends) {
            ends = false;
            if (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
              reply = Bacon.noMore;
              sink(endEvent());
            }
          }
          if (reply === Bacon.noMore) {
            unsubAll();
          }
          return reply;
        };
        return source.subscribe(function(e) {
          var reply;
          if (e.isEnd()) {
            ends = true;
            source.markEnded();
            flushLater();
          } else if (e.isError()) {
            reply = sink(e);
          } else {
            source.push(e);
            if (source.sync) {
              triggers.push({
                source: source,
                e: e
              });
              if (needsBarrier || UpdateBarrier.hasWaiters()) {
                flushLater();
              } else {
                flush();
              }
            }
          }
          if (reply === Bacon.noMore) {
            unsubAll();
          }
          return reply || Bacon.more;
        });
      };
    };
    return compositeUnsubscribe.apply(null, (function() {
      var _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = sources.length; _k < _len2; _k++) {
        s = sources[_k];
        _results.push(part(s));
      }
      return _results;
    })());
  });
};

containsDuplicateDeps = function(observables, state) {
  var checkObservable;
  if (state == null) {
    state = [];
  }
  checkObservable = function(obs) {
    var deps;
    if (_.contains(state, obs)) {
      return true;
    } else {
      deps = obs.internalDeps();
      if (deps.length) {
        state.push(obs);
        return _.any(deps, checkObservable);
      } else {
        state.push(obs);
        return false;
      }
    }
  };
  return _.any(observables, checkObservable);
};

constantToFunction = function(f) {
  if (_.isFunction(f)) {
    return f;
  } else {
    return _.always(f);
  }
};

var __slice = [].slice;

Bacon.groupSimultaneous = function() {
  var s, sources, streams;
  streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (streams.length === 1 && isArray(streams[0])) {
    streams = streams[0];
  }
  sources = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = streams.length; _i < _len; _i++) {
      s = streams[_i];
      _results.push(new BufferingSource(s));
    }
    return _results;
  })();
  return withDescription.apply(null, [Bacon, "groupSimultaneous"].concat(__slice.call(streams), [Bacon.when(sources, (function() {
    var xs;
    xs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return xs;
  }))]));
};

var assert, assertArray, assertEventStream, assertFunction, assertNoArguments, assertObservable, assertString, cloneArray, former, isArray, isObservable, latter, nop;

nop = function() {};

latter = function(_, x) {
  return x;
};

former = function(x, _) {
  return x;
};

cloneArray = function(xs) {
  return xs.slice(0);
};

assert = function(message, condition) {
  if (!condition) {
    throw new Exception(message);
  }
};

assertEventStream = function(event) {
  if (!(event instanceof EventStream)) {
    throw new Exception("not an EventStream : " + event);
  }
};

assertObservable = function(event) {
  if (!(event instanceof Observable)) {
    throw new Exception("not an Observable : " + event);
  }
};

assertFunction = function(f) {
  return assert("not a function : " + f, _.isFunction(f));
};

isArray = function(xs) {
  return xs instanceof Array;
};

isObservable = function(x) {
  return x instanceof Observable;
};

assertArray = function(xs) {
  if (!isArray(xs)) {
    throw new Exception("not an array : " + xs);
  }
};

assertNoArguments = function(args) {
  return assert("no arguments supported", args.length === 0);
};

assertString = function(x) {
  if (typeof x !== "string") {
    throw new Exception("not a string : " + x);
  }
};

var End, Error, Event, Initial, Next, endEvent, eventIdCounter, initialEvent, nextEvent, toEvent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

eventIdCounter = 0;

Event = (function() {
  function Event() {
    this.id = ++eventIdCounter;
  }

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

  Event.prototype.filter = function() {
    return true;
  };

  Event.prototype.inspect = function() {
    return this.toString();
  };

  Event.prototype.log = function() {
    return this.toString();
  };

  return Event;

})();

Next = (function(_super) {
  __extends(Next, _super);

  function Next(valueF, eager) {
    Next.__super__.constructor.call(this);
    if (!eager && _.isFunction(valueF) || valueF instanceof Next) {
      this.valueF = valueF;
      this.valueInternal = void 0;
    } else {
      this.valueF = void 0;
      this.valueInternal = valueF;
    }
  }

  Next.prototype.isNext = function() {
    return true;
  };

  Next.prototype.hasValue = function() {
    return true;
  };

  Next.prototype.value = function() {
    if (this.valueF instanceof Next) {
      this.valueInternal = this.valueF.value();
      this.valueF = void 0;
    } else if (this.valueF) {
      this.valueInternal = this.valueF();
      this.valueF = void 0;
    }
    return this.valueInternal;
  };

  Next.prototype.fmap = function(f) {
    var event, value;
    if (this.valueInternal) {
      value = this.valueInternal;
      return this.apply(function() {
        return f(value);
      });
    } else {
      event = this;
      return this.apply(function() {
        return f(event.value());
      });
    }
  };

  Next.prototype.apply = function(value) {
    return new Next(value);
  };

  Next.prototype.filter = function(f) {
    return f(this.value());
  };

  Next.prototype.toString = function() {
    return _.toString(this.value());
  };

  Next.prototype.log = function() {
    return this.value();
  };

  return Next;

})(Event);

Initial = (function(_super) {
  __extends(Initial, _super);

  function Initial() {
    return Initial.__super__.constructor.apply(this, arguments);
  }

  Initial.prototype.isInitial = function() {
    return true;
  };

  Initial.prototype.isNext = function() {
    return false;
  };

  Initial.prototype.apply = function(value) {
    return new Initial(value);
  };

  Initial.prototype.toNext = function() {
    return new Next(this);
  };

  return Initial;

})(Next);

End = (function(_super) {
  __extends(End, _super);

  function End() {
    return End.__super__.constructor.apply(this, arguments);
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

  End.prototype.toString = function() {
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

  Error.prototype.toString = function() {
    return "<error> " + _.toString(this.error);
  };

  return Error;

})(Event);

Bacon.Initial = Initial;

Bacon.Next = Next;

Bacon.End = End;

Bacon.Error = Error;

initialEvent = function(value) {
  return new Initial(value, true);
};

nextEvent = function(value) {
  return new Next(value, true);
};

endEvent = function() {
  return new End();
};

toEvent = function(x) {
  if (x instanceof Event) {
    return x;
  } else {
    return nextEvent(x);
  }
};

Bacon.noMore = ["<no-more>"];

Bacon.more = ["<more>"];

var Dispatcher,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Dispatcher = (function() {
  function Dispatcher(_subscribe, _handleEvent) {
    this._subscribe = _subscribe;
    this._handleEvent = _handleEvent;
    this.subscribe = __bind(this.subscribe, this);
    this.handleEvent = __bind(this.handleEvent, this);
    this.subscriptions = [];
    this.queue = [];
    this.pushing = false;
    this.ended = false;
    this.prevError = void 0;
    this.unsubSrc = void 0;
  }

  Dispatcher.prototype.hasSubscribers = function() {
    return this.subscriptions.length > 0;
  };

  Dispatcher.prototype.removeSub = function(subscription) {
    return this.subscriptions = _.without(subscription, this.subscriptions);
  };

  Dispatcher.prototype.push = function(event) {
    if (event.isEnd()) {
      this.ended = true;
    }
    return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
  };

  Dispatcher.prototype.pushToSubscriptions = function(event) {
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

  Dispatcher.prototype.pushIt = function(event) {
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

  Dispatcher.prototype.handleEvent = function(event) {
    if (this._handleEvent) {
      return this._handleEvent(event);
    } else {
      return this.push(event);
    }
  };

  Dispatcher.prototype.unsubscribeFromSource = function() {
    if (this.unsubSrc) {
      this.unsubSrc();
    }
    return this.unsubSrc = void 0;
  };

  Dispatcher.prototype.subscribe = function(sink) {
    var subscription;
    if (this.ended) {
      sink(endEvent());
      return nop;
    } else {
      assertFunction(sink);
      subscription = {
        sink: sink
      };
      this.subscriptions.push(subscription);
      if (this.subscriptions.length === 1) {
        this.unsubSrc = this._subscribe(this.handleEvent);
        assertFunction(this.unsubSrc);
      }
      return (function(_this) {
        return function() {
          _this.removeSub(subscription);
          if (!_this.hasSubscribers()) {
            return _this.unsubscribeFromSource();
          }
        };
      })(this);
    }
  };

  return Dispatcher;

})();

var EventStream,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventStream = (function(_super) {
  __extends(EventStream, _super);

  function EventStream(desc, subscribe, handler) {
    if (_.isFunction(desc)) {
      handler = subscribe;
      subscribe = desc;
      desc = [];
    }
    EventStream.__super__.constructor.call(this, desc);
    assertFunction(subscribe);
    this.dispatcher = new Dispatcher(subscribe, handler);
    registerObs(this);
  }

  EventStream.prototype.toProperty = function(initValue_) {
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
  };

  EventStream.prototype.toEventStream = function() {
    return this;
  };

  EventStream.prototype.startWith = function(seed) {
    return withDescription(this, "startWith", seed, Bacon.once(seed).concat(this));
  };

  EventStream.prototype.withHandler = function(handler) {
    return new EventStream(describe(this, "withHandler", handler), this.dispatcher.subscribe, handler);
  };

  return EventStream;

})(Observable);

Bacon.EventStream = EventStream;

var Property, PropertyDispatcher,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PropertyDispatcher = (function(_super) {
  __extends(PropertyDispatcher, _super);

  function PropertyDispatcher(property, subscribe, handleEvent) {
    this.property = property;
    this.subscribe = __bind(this.subscribe, this);
    PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
    this.current = None;
    this.currentValueRootId = void 0;
    this.propertyEnded = false;
  }

  PropertyDispatcher.prototype.push = function(event) {
    if (event.isEnd()) {
      this.propertyEnded = true;
    }
    if (event.hasValue()) {
      this.current = new Some(event);
      this.currentValueRootId = UpdateBarrier.currentEventId();
    }
    return PropertyDispatcher.__super__.push.call(this, event);
  };

  PropertyDispatcher.prototype.maybeSubSource = function(sink, reply) {
    if (reply === Bacon.noMore) {
      return nop;
    } else if (this.propertyEnded) {
      sink(endEvent());
      return nop;
    } else {
      return Dispatcher.prototype.subscribe.call(this, sink);
    }
  };

  PropertyDispatcher.prototype.subscribe = function(sink) {
    var dispatchingId, initSent, reply, valId;
    initSent = false;
    reply = Bacon.more;
    if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
      dispatchingId = UpdateBarrier.currentEventId();
      valId = this.currentValueRootId;
      if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
        UpdateBarrier.whenDoneWith(this.property, (function(_this) {
          return function() {
            if (_this.currentValueRootId === valId) {
              return sink(initialEvent(_this.current.get().value()));
            }
          };
        })(this));
        return this.maybeSubSource(sink, reply);
      } else {
        UpdateBarrier.inTransaction(void 0, this, (function() {
          return reply = sink(initialEvent(this.current.get().value()));
        }), []);
        return this.maybeSubSource(sink, reply);
      }
    } else {
      return this.maybeSubSource(sink, reply);
    }
  };

  return PropertyDispatcher;

})(Dispatcher);

Property = (function(_super) {
  __extends(Property, _super);

  function Property(desc, subscribe, handler) {
    if (_.isFunction(desc)) {
      handler = subscribe;
      subscribe = desc;
      desc = [];
    }
    Property.__super__.constructor.call(this, desc);
    assertFunction(subscribe);
    this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
    registerObs(this);
  }

  Property.prototype.changes = function() {
    return new EventStream(describe(this, "changes"), (function(_this) {
      return function(sink) {
        return _this.dispatcher.subscribe(function(event) {
          if (!event.isInitial()) {
            return sink(event);
          }
        });
      };
    })(this));
  };

  Property.prototype.withHandler = function(handler) {
    return new Property(describe(this, "withHandler", handler), this.dispatcher.subscribe, handler);
  };

  Property.prototype.toProperty = function() {
    assertNoArguments(arguments);
    return this;
  };

  Property.prototype.toEventStream = function() {
    return new EventStream(describe(this, "toEventStream"), (function(_this) {
      return function(sink) {
        return _this.dispatcher.subscribe(function(event) {
          if (event.isInitial()) {
            event = event.toNext();
          }
          return sink(event);
        });
      };
    })(this));
  };

  return Property;

})(Observable);

Bacon.Property = Property;

var __slice = [].slice;

Bacon.fromBinder = function(binder, eventTransformer) {
  if (eventTransformer == null) {
    eventTransformer = _.id;
  }
  return new EventStream(describe(Bacon, "fromBinder", binder, eventTransformer), function(sink) {
    var shouldUnbind, unbind, unbinder, unbound;
    unbound = false;
    shouldUnbind = false;
    unbind = function() {
      if (!unbound) {
        if (typeof unbinder !== "undefined" && unbinder !== null) {
          unbinder();
          return unbound = true;
        } else {
          return shouldUnbind = true;
        }
      }
    };
    unbinder = binder(function() {
      var args, event, reply, value, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      value = eventTransformer.apply(this, args);
      if (!(isArray(value) && _.last(value) instanceof Event)) {
        value = [value];
      }
      reply = Bacon.more;
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        event = value[_i];
        reply = sink(event = toEvent(event));
        if (reply === Bacon.noMore || event.isEnd()) {
          unbind();
          return reply;
        }
      }
      return reply;
    });
    if (shouldUnbind) {
      unbind();
    }
    return unbind;
  });
};

Bacon.fromEventTarget = function(target, eventName, eventTransformer) {
  var sub, unsub, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
  sub = (_ref = (_ref1 = (_ref2 = target.addEventListener) != null ? _ref2 : target.addListener) != null ? _ref1 : target.bind) != null ? _ref : target.on;
  unsub = (_ref3 = (_ref4 = (_ref5 = target.removeEventListener) != null ? _ref5 : target.removeListener) != null ? _ref4 : target.unbind) != null ? _ref3 : target.off;
  return withDescription(Bacon, "fromEventTarget", target, eventName, Bacon.fromBinder(function(handler) {
    sub.call(target, eventName, handler);
    return function() {
      return unsub.call(target, eventName, handler);
    };
  }, eventTransformer));
};

Bacon.fromPromise = function(promise, abort) {
  return withDescription(Bacon, "fromPromise", promise, Bacon.fromBinder(function(handler) {
    promise.then(handler, function(e) {
      return handler(new Error(e));
    });
    return function() {
      if (abort) {
        return typeof promise.abort === "function" ? promise.abort() : void 0;
      }
    };
  }, (function(value) {
    return [value, endEvent()];
  })));
};

Bacon.constant = function(value) {
  return new Property(describe(Bacon, "constant", value), function(sink) {
    sink(initialEvent(value));
    sink(endEvent());
    return nop;
  });
};

Bacon.never = function() {
  return new EventStream(describe(Bacon, "never"), function(sink) {
    sink(endEvent());
    return nop;
  });
};

Bacon.once = function(value) {
  return new EventStream(describe(Bacon, "once", value), function(sink) {
    sink(toEvent(value));
    sink(endEvent());
    return nop;
  });
};

Bacon.fromArray = function(values) {
  var i;
  assertArray(values);
  if (!values.length) {
    return withDescription(Bacon, "fromArray", values, Bacon.never());
  } else {
    i = 0;
    return new EventStream(describe(Bacon, "fromArray", values), function(sink) {
      var push, reply, unsubd;
      unsubd = false;
      reply = Bacon.more;
      push = function() {
        var value;
        if ((reply !== Bacon.noMore) && !unsubd) {
          value = values[i++];
          reply = sink(toEvent(value));
          if (reply !== Bacon.noMore) {
            if (i === values.length) {
              return sink(endEvent());
            } else {
              return UpdateBarrier.afterTransaction(push);
            }
          }
        }
      };
      push();
      return function() {
        return unsubd = true;
      };
    });
  }
};



var __slice = [].slice;

Bacon.combineAsArray = function() {
  var index, s, sources, stream, streams, _i, _len;
  streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (streams.length === 1 && isArray(streams[0])) {
    streams = streams[0];
  }
  for (index = _i = 0, _len = streams.length; _i < _len; index = ++_i) {
    stream = streams[index];
    if (!(isObservable(stream))) {
      streams[index] = Bacon.constant(stream);
    }
  }
  if (streams.length) {
    sources = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = streams.length; _j < _len1; _j++) {
        s = streams[_j];
        _results.push(new Source(s, true));
      }
      return _results;
    })();
    return withDescription.apply(null, [Bacon, "combineAsArray"].concat(__slice.call(streams), [Bacon.when(sources, (function() {
      var xs;
      xs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return xs;
    })).toProperty()]));
  } else {
    return Bacon.constant([]);
  }
};

Bacon.onValues = function() {
  var f, streams, _i;
  streams = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), f = arguments[_i++];
  return Bacon.combineAsArray(streams).onValues(f);
};

Bacon.combineWith = function() {
  var f, streams;
  f = arguments[0], streams = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return withDescription.apply(null, [Bacon, "combineWith", f].concat(__slice.call(streams), [Bacon.combineAsArray(streams).map(function(values) {
    return f.apply(null, values);
  })]));
};

Bacon.combineTemplate = function(template) {
  var applyStreamValue, combinator, compile, compileTemplate, constantValue, current, funcs, mkContext, setValue, streams;
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
    return function(ctxStack) {
      return setValue(ctxStack, key, value);
    };
  };
  mkContext = function(template) {
    if (isArray(template)) {
      return [];
    } else {
      return {};
    }
  };
  compile = function(key, value) {
    var popContext, pushContext;
    if (isObservable(value)) {
      streams.push(value);
      return funcs.push(applyStreamValue(key, streams.length - 1));
    } else if (value === Object(value) && typeof value !== "function" && !(value instanceof RegExp) && !(value instanceof Date)) {
      pushContext = function(key) {
        return function(ctxStack) {
          var newContext;
          newContext = mkContext(value);
          setValue(ctxStack, key, newContext);
          return ctxStack.push(newContext);
        };
      };
      popContext = function(ctxStack) {
        return ctxStack.pop();
      };
      funcs.push(pushContext(key));
      compileTemplate(value);
      return funcs.push(popContext);
    } else {
      return funcs.push(constantValue(key, value));
    }
  };
  compileTemplate = function(template) {
    return _.each(template, compile);
  };
  compileTemplate(template);
  combinator = function(values) {
    var ctxStack, f, rootContext, _i, _len;
    rootContext = mkContext(template);
    ctxStack = [rootContext];
    for (_i = 0, _len = funcs.length; _i < _len; _i++) {
      f = funcs[_i];
      f(ctxStack, values);
    }
    return rootContext;
  };
  return withDescription(Bacon, "combineTemplate", template, Bacon.combineAsArray(streams).map(combinator));
};

Bacon.Observable.prototype.combine = function(other, f) {
  var combinator;
  combinator = toCombinator(f);
  return withDescription(this, "combine", other, f, Bacon.combineAsArray(this, other).map(function(values) {
    return combinator(values[0], values[1]);
  }));
};

Bacon.Observable.prototype.decode = function(cases) {
  return withDescription(this, "decode", cases, this.combine(Bacon.combineTemplate(cases), function(key, values) {
    return values[key];
  }));
};

Bacon.Observable.prototype.withStateMachine = function(initState, f) {
  var state;
  state = initState;
  return withDescription(this, "withStateMachine", initState, f, this.withHandler(function(event) {
    var fromF, newState, output, outputs, reply, _i, _len;
    fromF = f(state, event);
    newState = fromF[0], outputs = fromF[1];
    state = newState;
    reply = Bacon.more;
    for (_i = 0, _len = outputs.length; _i < _len; _i++) {
      output = outputs[_i];
      reply = this.push(output);
      if (reply === Bacon.noMore) {
        return reply;
      }
    }
    return reply;
  }));
};

Bacon.Observable.prototype.skipDuplicates = function(isEqual) {
  if (isEqual == null) {
    isEqual = function(a, b) {
      return a === b;
    };
  }
  return withDescription(this, "skipDuplicates", this.withStateMachine(None, function(prev, event) {
    if (!event.hasValue()) {
      return [prev, [event]];
    } else if (event.isInitial() || prev === None || !isEqual(prev.get(), event.value())) {
      return [new Some(event.value()), [event]];
    } else {
      return [prev, []];
    }
  }));
};

Bacon.Observable.prototype.awaiting = function(other) {
  return withDescription(this, "awaiting", other, Bacon.groupSimultaneous(this, other).map(function(_arg) {
    var myValues, otherValues;
    myValues = _arg[0], otherValues = _arg[1];
    return otherValues.length === 0;
  }).toProperty(false).skipDuplicates());
};

Bacon.Observable.prototype.not = function() {
  return withDescription(this, "not", this.map(function(x) {
    return !x;
  }));
};

Bacon.Property.prototype.and = function(other) {
  return withDescription(this, "and", other, this.combine(other, function(x, y) {
    return x && y;
  }));
};

Bacon.Property.prototype.or = function(other) {
  return withDescription(this, "or", other, this.combine(other, function(x, y) {
    return x || y;
  }));
};

Bacon.scheduler = {
  setTimeout: function (f, d) {
    return setTimeout(f, d);
  },
  setInterval: function (f, i) {
    return setInterval(f, i);
  },
  clearInterval: function (id) {
    return clearInterval(id);
  },
  now: function () {
    return new Date().getTime();
  } };
Bacon.EventStream.prototype.bufferWithTime = function(delay) {
  return withDescription(this, "bufferWithTime", delay, this.bufferWithTimeOrCount(delay, Number.MAX_VALUE));
};

Bacon.EventStream.prototype.bufferWithCount = function(count) {
  return withDescription(this, "bufferWithCount", count, this.bufferWithTimeOrCount(void 0, count));
};

Bacon.EventStream.prototype.bufferWithTimeOrCount = function(delay, count) {
  var flushOrSchedule;
  flushOrSchedule = function(buffer) {
    if (buffer.values.length === count) {
      return buffer.flush();
    } else if (delay !== void 0) {
      return buffer.schedule();
    }
  };
  return withDescription(this, "bufferWithTimeOrCount", delay, count, this.buffer(delay, flushOrSchedule, flushOrSchedule));
};

Bacon.EventStream.prototype.buffer = function(delay, onInput, onFlush) {
  var buffer, delayMs, reply;
  if (onInput == null) {
    onInput = nop;
  }
  if (onFlush == null) {
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
        reply = this.push(nextEvent(this.values));
        this.values = [];
        if (this.end != null) {
          return this.push(this.end);
        } else if (reply !== Bacon.noMore) {
          return onFlush(this);
        }
      } else {
        if (this.end != null) {
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
  if (!_.isFunction(delay)) {
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
};

var __slice = [].slice;

Bacon.Observable.prototype.filter = function() {
  var args, f;
  f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return convertArgsToFunction(this, f, args, function(f) {
    return withDescription(this, "filter", f, this.withHandler(function(event) {
      if (event.filter(f)) {
        return this.push(event);
      } else {
        return Bacon.more;
      }
    }));
  });
};

Bacon.EventStream.prototype.concat = function(right) {
  var left;
  left = this;
  return new EventStream(describe(left, "concat", right), function(sink) {
    var unsubLeft, unsubRight;
    unsubRight = nop;
    unsubLeft = left.dispatcher.subscribe(function(e) {
      if (e.isEnd()) {
        return unsubRight = right.dispatcher.subscribe(sink);
      } else {
        return sink(e);
      }
    });
    return function() {
      unsubLeft();
      return unsubRight();
    };
  });
};

var flatMap_, makeObservable, makeSpawner;

Bacon.Observable.prototype.flatMap = function() {
  return flatMap_(this, makeSpawner(arguments));
};

Bacon.Observable.prototype.flatMapFirst = function() {
  return flatMap_(this, makeSpawner(arguments), true);
};

flatMap_ = function(root, f, firstOnly, limit) {
  var childDeps, result, rootDep;
  rootDep = [root];
  childDeps = [];
  result = new EventStream(describe(root, "flatMap" + (firstOnly ? "First" : ""), f), function(sink) {
    var checkEnd, checkQueue, composite, queue, spawn;
    composite = new CompositeUnsubscribe();
    queue = [];
    spawn = function(event) {
      var child;
      child = makeObservable(f(event.value()));
      childDeps.push(child);
      return composite.add(function(unsubAll, unsubMe) {
        return child.dispatcher.subscribe(function(event) {
          var reply;
          if (event.isEnd()) {
            _.remove(child, childDeps);
            checkQueue();
            checkEnd(unsubMe);
            return Bacon.noMore;
          } else {
            if (event instanceof Initial) {
              event = event.toNext();
            }
            reply = sink(event);
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply;
          }
        });
      });
    };
    checkQueue = function() {
      var event;
      event = queue.shift();
      if (event) {
        return spawn(event);
      }
    };
    checkEnd = function(unsub) {
      unsub();
      if (composite.empty()) {
        return sink(endEvent());
      }
    };
    composite.add(function(__, unsubRoot) {
      return root.dispatcher.subscribe(function(event) {
        if (event.isEnd()) {
          return checkEnd(unsubRoot);
        } else if (event.isError()) {
          return sink(event);
        } else if (firstOnly && composite.count() > 1) {
          return Bacon.more;
        } else {
          if (composite.unsubscribed) {
            return Bacon.noMore;
          }
          if (limit && composite.count() > limit) {
            return queue.push(event);
          } else {
            return spawn(event);
          }
        }
      });
    });
    return composite.unsubscribe;
  });
  result.internalDeps = function() {
    if (childDeps.length) {
      return rootDep.concat(childDeps);
    } else {
      return rootDep;
    }
  };
  return result;
};

makeSpawner = function(args) {
  if (args.length === 1 && isObservable(args[0])) {
    return _.always(args[0]);
  } else {
    return makeFunctionArgs(args);
  }
};

makeObservable = function(x) {
  if (isObservable(x)) {
    return x;
  } else {
    return Bacon.once(x);
  }
};

var __slice = [].slice;

Bacon.Observable.prototype.flatMapWithConcurrencyLimit = function() {
  var args, limit;
  limit = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return withDescription.apply(null, [this, "flatMapWithConcurrencyLimit", limit].concat(__slice.call(args), [flatMap_(this, makeSpawner(args), false, limit)]));
};

var __slice = [].slice;

Bacon.Observable.prototype.flatMapConcat = function() {
  return withDescription.apply(null, [this, "flatMapConcat"].concat(__slice.call(arguments), [this.flatMapWithConcurrencyLimit.apply(this, [1].concat(__slice.call(arguments)))]));
};

Bacon.Observable.prototype.bufferingThrottle = function(minimumInterval) {
  return withDescription(this, "bufferingThrottle", minimumInterval, this.flatMapConcat(function(x) {
    return Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false));
  }));
};

Bacon.Property.prototype.bufferingThrottle = function() {
  return Bacon.Observable.prototype.bufferingThrottle.apply(this, arguments).toProperty();
};

var Bus,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Bus = (function(_super) {
  __extends(Bus, _super);

  function Bus() {
    this.guardedSink = __bind(this.guardedSink, this);
    this.subscribeAll = __bind(this.subscribeAll, this);
    this.unsubAll = __bind(this.unsubAll, this);
    this.sink = void 0;
    this.subscriptions = [];
    this.ended = false;
    Bus.__super__.constructor.call(this, describe(Bacon, "Bus"), this.subscribeAll);
  }

  Bus.prototype.unsubAll = function() {
    var sub, _i, _len, _ref;
    _ref = this.subscriptions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sub = _ref[_i];
      if (typeof sub.unsub === "function") {
        sub.unsub();
      }
    }
    return void 0;
  };

  Bus.prototype.subscribeAll = function(newSink) {
    var subscription, _i, _len, _ref;
    this.sink = newSink;
    _ref = cloneArray(this.subscriptions);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription = _ref[_i];
      this.subscribeInput(subscription);
    }
    return this.unsubAll;
  };

  Bus.prototype.guardedSink = function(input) {
    return (function(_this) {
      return function(event) {
        if (event.isEnd()) {
          _this.unsubscribeInput(input);
          return Bacon.noMore;
        } else {
          return _this.sink(event);
        }
      };
    })(this);
  };

  Bus.prototype.subscribeInput = function(subscription) {
    return subscription.unsub = subscription.input.dispatcher.subscribe(this.guardedSink(subscription.input));
  };

  Bus.prototype.unsubscribeInput = function(input) {
    var i, sub, _i, _len, _ref;
    _ref = this.subscriptions;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      sub = _ref[i];
      if (sub.input === input) {
        if (typeof sub.unsub === "function") {
          sub.unsub();
        }
        this.subscriptions.splice(i, 1);
        return;
      }
    }
  };

  Bus.prototype.plug = function(input) {
    var sub;
    assertObservable(input);
    if (this.ended) {
      return;
    }
    sub = {
      input: input
    };
    this.subscriptions.push(sub);
    if ((this.sink != null)) {
      this.subscribeInput(sub);
    }
    return (function(_this) {
      return function() {
        return _this.unsubscribeInput(input);
      };
    })(this);
  };

  Bus.prototype.end = function() {
    this.ended = true;
    this.unsubAll();
    return typeof this.sink === "function" ? this.sink(endEvent()) : void 0;
  };

  Bus.prototype.push = function(value) {
    return typeof this.sink === "function" ? this.sink(nextEvent(value)) : void 0;
  };

  Bus.prototype.error = function(error) {
    return typeof this.sink === "function" ? this.sink(new Error(error)) : void 0;
  };

  return Bus;

})(EventStream);

Bacon.Bus = Bus;

var liftCallback,
  __slice = [].slice;

liftCallback = function(desc, wrapped) {
  return withMethodCallSupport(function() {
    var args, f, stream;
    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    stream = partiallyApplied(wrapped, [
      function(values, callback) {
        return f.apply(null, __slice.call(values).concat([callback]));
      }
    ]);
    return withDescription.apply(null, [Bacon, desc, f].concat(__slice.call(args), [Bacon.combineAsArray(args).flatMap(stream)]));
  });
};

Bacon.fromCallback = liftCallback("fromCallback", function() {
  var args, f;
  f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return Bacon.fromBinder(function(handler) {
    makeFunction(f, args)(handler);
    return nop;
  }, (function(value) {
    return [value, endEvent()];
  }));
});

Bacon.fromNodeCallback = liftCallback("fromNodeCallback", function() {
  var args, f;
  f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return Bacon.fromBinder(function(handler) {
    makeFunction(f, args)(handler);
    return nop;
  }, function(error, value) {
    if (error) {
      return [new Error(error), endEvent()];
    }
    return [value, endEvent()];
  });
});

var addPropertyInitValueToStream;

addPropertyInitValueToStream = function(property, stream) {
  var justInitValue;
  justInitValue = new EventStream(describe(property, "justInitValue"), function(sink) {
    var unsub, value;
    value = void 0;
    unsub = property.dispatcher.subscribe(function(event) {
      if (!event.isEnd()) {
        value = event;
      }
      return Bacon.noMore;
    });
    UpdateBarrier.whenDoneWith(justInitValue, function() {
      if (value != null) {
        sink(value);
      }
      return sink(endEvent());
    });
    return unsub;
  });
  return justInitValue.concat(stream).toProperty();
};

Bacon.Observable.prototype.mapEnd = function() {
  var f;
  f = makeFunctionArgs(arguments);
  return withDescription(this, "mapEnd", f, this.withHandler(function(event) {
    if (event.isEnd()) {
      this.push(nextEvent(f(event)));
      this.push(endEvent());
      return Bacon.noMore;
    } else {
      return this.push(event);
    }
  }));
};

Bacon.Observable.prototype.skipErrors = function() {
  return withDescription(this, "skipErrors", this.withHandler(function(event) {
    if (event.isError()) {
      return Bacon.more;
    } else {
      return this.push(event);
    }
  }));
};

Bacon.EventStream.prototype.takeUntil = function(stopper) {
  var endMarker;
  endMarker = {};
  return withDescription(this, "takeUntil", stopper, Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors()).withHandler(function(event) {
    var data, reply, value, _i, _len, _ref;
    if (!event.hasValue()) {
      return this.push(event);
    } else {
      _ref = event.value(), data = _ref[0], stopper = _ref[1];
      if (stopper.length) {
        return this.push(endEvent());
      } else {
        reply = Bacon.more;
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          value = data[_i];
          if (value === endMarker) {
            reply = this.push(endEvent());
          } else {
            reply = this.push(nextEvent(value));
          }
        }
        return reply;
      }
    }
  }));
};

Bacon.Property.prototype.takeUntil = function(stopper) {
  var changes;
  changes = this.changes().takeUntil(stopper);
  return withDescription(this, "takeUntil", stopper, addPropertyInitValueToStream(this, changes));
};

Bacon.Observable.prototype.flatMapLatest = function() {
  var f, stream;
  f = makeSpawner(arguments);
  stream = this.toEventStream();
  return withDescription(this, "flatMapLatest", f, stream.flatMap(function(value) {
    return makeObservable(f(value)).takeUntil(stream);
  }));
};

var __slice = [].slice;

Bacon.fromPoll = function(delay, poll) {
  return withDescription(Bacon, "fromPoll", delay, poll, Bacon.fromBinder((function(handler) {
    var id;
    id = Bacon.scheduler.setInterval(handler, delay);
    return function() {
      return Bacon.scheduler.clearInterval(id);
    };
  }), poll));
};

Bacon.later = function(delay, value) {
  return withDescription(Bacon, "later", delay, value, Bacon.fromPoll(delay, function() {
    return [value, endEvent()];
  }));
};

Bacon.sequentially = function(delay, values) {
  var index;
  index = 0;
  return withDescription(Bacon, "sequentially", delay, values, Bacon.fromPoll(delay, function() {
    var value;
    value = values[index++];
    if (index < values.length) {
      return value;
    } else if (index === values.length) {
      return [value, endEvent()];
    } else {
      return endEvent();
    }
  }));
};

Bacon.repeatedly = function(delay, values) {
  var index;
  index = 0;
  return withDescription(Bacon, "repeatedly", delay, values, Bacon.fromPoll(delay, function() {
    return values[index++ % values.length];
  }));
};

Bacon.interval = function(delay, value) {
  if (value == null) {
    value = {};
  }
  return withDescription(Bacon, "interval", delay, value, Bacon.fromPoll(delay, function() {
    return nextEvent(value);
  }));
};

Bacon.EventStream.prototype.delay = function(delay) {
  return withDescription(this, "delay", delay, this.flatMap(function(value) {
    return Bacon.later(delay, value);
  }));
};

Bacon.Property.prototype.delay = function(delay) {
  return this.delayChanges("delay", delay, function(changes) {
    return changes.delay(delay);
  });
};

Bacon.Property.prototype.delayChanges = function() {
  var desc, f, _i;
  desc = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), f = arguments[_i++];
  return withDescription.apply(null, [this].concat(__slice.call(desc), [addPropertyInitValueToStream(this, f(this.changes()))]));
};

Bacon.EventStream.prototype.debounce = function(delay) {
  return withDescription(this, "debounce", delay, this.flatMapLatest(function(value) {
    return Bacon.later(delay, value);
  }));
};

Bacon.Property.prototype.debounce = function(delay) {
  return this.delayChanges("debounce", delay, function(changes) {
    return changes.debounce(delay);
  });
};

Bacon.EventStream.prototype.debounceImmediate = function(delay) {
  return withDescription(this, "debounceImmediate", delay, this.flatMapFirst(function(value) {
    return Bacon.once(value).concat(Bacon.later(delay).filter(false));
  }));
};

Bacon.Observable.prototype.scan = function(seed, f) {
  var acc, resultProperty, subscribe;
  f = toCombinator(f);
  acc = toOption(seed);
  subscribe = (function(_this) {
    return function(sink) {
      var initSent, reply, sendInit, unsub;
      initSent = false;
      unsub = nop;
      reply = Bacon.more;
      sendInit = function() {
        if (!initSent) {
          return acc.forEach(function(value) {
            initSent = true;
            reply = sink(new Initial(function() {
              return value;
            }));
            if (reply === Bacon.noMore) {
              unsub();
              return unsub = nop;
            }
          });
        }
      };
      unsub = _this.dispatcher.subscribe(function(event) {
        var next, prev;
        if (event.hasValue()) {
          if (initSent && event.isInitial()) {
            return Bacon.more;
          } else {
            if (!event.isInitial()) {
              sendInit();
            }
            initSent = true;
            prev = acc.getOrElse(void 0);
            next = f(prev, event.value());
            acc = new Some(next);
            return sink(event.apply(function() {
              return next;
            }));
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
      UpdateBarrier.whenDoneWith(resultProperty, sendInit);
      return unsub;
    };
  })(this);
  return resultProperty = new Property(describe(this, "scan", seed, f), subscribe);
};

Bacon.Observable.prototype.diff = function(start, f) {
  f = toCombinator(f);
  return withDescription(this, "diff", start, f, this.scan([start], function(prevTuple, next) {
    return [next, f(prevTuple[0], next)];
  }).filter(function(tuple) {
    return tuple.length === 2;
  }).map(function(tuple) {
    return tuple[1];
  }));
};

Bacon.Observable.prototype.doAction = function() {
  var f;
  f = makeFunctionArgs(arguments);
  return withDescription(this, "doAction", f, this.withHandler(function(event) {
    if (event.hasValue()) {
      f(event.value());
    }
    return this.push(event);
  }));
};

var __slice = [].slice;

Bacon.Observable.prototype.endOnError = function() {
  var args, f;
  f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (f == null) {
    f = true;
  }
  return convertArgsToFunction(this, f, args, function(f) {
    return withDescription(this, "endOnError", this.withHandler(function(event) {
      if (event.isError() && f(event.error)) {
        this.push(event);
        return this.push(endEvent());
      } else {
        return this.push(event);
      }
    }));
  });
};

Bacon.Observable.prototype.mapError = function() {
  var f;
  f = makeFunctionArgs(arguments);
  return withDescription(this, "mapError", f, this.withHandler(function(event) {
    if (event.isError()) {
      return this.push(nextEvent(f(event.error)));
    } else {
      return this.push(event);
    }
  }));
};

Bacon.Observable.prototype.flatMapError = function(fn) {
  return withDescription(this, "flatMapError", fn, this.mapError(function(err) {
    return new Error(err);
  }).flatMap(function(x) {
    if (x instanceof Error) {
      return fn(x.error);
    } else {
      return Bacon.once(x);
    }
  }));
};

var __slice = [].slice;

Bacon.EventStream.prototype.sampledBy = function(sampler, combinator) {
  return withDescription(this, "sampledBy", sampler, combinator, this.toProperty().sampledBy(sampler, combinator));
};

Bacon.Property.prototype.sampledBy = function(sampler, combinator) {
  var lazy, result, samplerSource, stream, thisSource;
  if (combinator != null) {
    combinator = toCombinator(combinator);
  } else {
    lazy = true;
    combinator = function(f) {
      return f.value();
    };
  }
  thisSource = new Source(this, false, lazy);
  samplerSource = new Source(sampler, true, lazy);
  stream = Bacon.when([thisSource, samplerSource], combinator);
  result = sampler instanceof Property ? stream.toProperty() : stream;
  return withDescription(this, "sampledBy", sampler, combinator, result);
};

Bacon.Property.prototype.sample = function(interval) {
  return withDescription(this, "sample", interval, this.sampledBy(Bacon.interval(interval, {})));
};

Bacon.Observable.prototype.map = function() {
  var args, p;
  p = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (p instanceof Property) {
    return p.sampledBy(this, former);
  } else {
    return convertArgsToFunction(this, p, args, function(f) {
      return withDescription(this, "map", f, this.withHandler(function(event) {
        return this.push(event.fmap(f));
      }));
    });
  }
};

Bacon.Observable.prototype.fold = function(seed, f) {
  return withDescription(this, "fold", seed, f, this.scan(seed, f).sampledBy(this.filter(false).mapEnd().toProperty()));
};

Observable.prototype.reduce = Observable.prototype.fold;

var __slice = [].slice;

Bacon.EventStream.prototype.merge = function(right) {
  var left;
  assertEventStream(right);
  left = this;
  return withDescription(left, "merge", right, Bacon.mergeAll(this, right));
};

Bacon.mergeAll = function() {
  var streams;
  streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (isArray(streams[0])) {
    streams = streams[0];
  }
  if (streams.length) {
    return new EventStream(describe.apply(null, [Bacon, "mergeAll"].concat(__slice.call(streams))), function(sink) {
      var ends, sinks, smartSink;
      ends = 0;
      smartSink = function(obs) {
        return function(unsubBoth) {
          return obs.dispatcher.subscribe(function(event) {
            var reply;
            if (event.isEnd()) {
              ends++;
              if (ends === streams.length) {
                return sink(endEvent());
              } else {
                return Bacon.more;
              }
            } else {
              reply = sink(event);
              if (reply === Bacon.noMore) {
                unsubBoth();
              }
              return reply;
            }
          });
        };
      };
      sinks = _.map(smartSink, streams);
      return compositeUnsubscribe.apply(null, sinks);
    });
  } else {
    return Bacon.never();
  }
};

Bacon.Observable.prototype.take = function(count) {
  if (count <= 0) {
    return Bacon.never();
  }
  return withDescription(this, "take", count, this.withHandler(function(event) {
    if (!event.hasValue()) {
      return this.push(event);
    } else {
      count--;
      if (count > 0) {
        return this.push(event);
      } else {
        if (count === 0) {
          this.push(event);
        }
        this.push(endEvent());
        return Bacon.noMore;
      }
    }
  }));
};

Bacon.EventStream.prototype.holdWhen = function(valve) {
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
};

// build-dependencies: core

// TODO: cleanup coffeism

// eventTransformer - defaults to returning the first argument to handler
Bacon.$ = {};
Bacon.$.asEventStream = function(eventName, selector, eventTransformer) {
  // selector is optional argument
  if (isFunction(selector)) {
  	eventTransformer = selector;
  	selector = undefined;
  }

  return withDescription(this.selector || this, "asEventStream", eventName, Bacon.fromBinder((function(_this) {
    return function(handler) {
      _this.on(eventName, selector, handler);
      return function() {
        return _this.off(eventName, selector, handler);
      };
    };
  })(this), eventTransformer));
};

if (typeof jQuery === "object") {
  jQuery.fn.asEventStream = Bacon.$.asEventStream;
} else if (typeof Zepto === "object") {
  Zepto.fn.asEventStream = Bacon.$.asEventStream;
}

var __slice = [].slice;

Bacon.Observable.prototype.log = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  this.subscribe(function(event) {
    return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, __slice.call(args).concat([event.log()])) : void 0 : void 0;
  });
  return this;
};

Bacon.retry = function(options) {
  var delay, isRetryable, maxRetries, retries, retry, source;
  if (!_.isFunction(options.source)) {
    throw new Exception("'source' option has to be a function");
  }
  source = options.source;
  retries = options.retries || 0;
  maxRetries = options.maxRetries || retries;
  delay = options.delay || function() {
    return 0;
  };
  isRetryable = options.isRetryable || function() {
    return true;
  };
  retry = function(context) {
    var delayedRetry, nextAttemptOptions;
    nextAttemptOptions = {
      source: source,
      retries: retries - 1,
      maxRetries: maxRetries,
      delay: delay,
      isRetryable: isRetryable
    };
    delayedRetry = function() {
      return Bacon.retry(nextAttemptOptions);
    };
    return Bacon.later(delay(context)).filter(false).concat(Bacon.once().flatMap(delayedRetry));
  };
  return withDescription(Bacon, "retry", options, source().flatMapError(function(e) {
    if (isRetryable(e) && retries > 0) {
      return retry({
        error: e,
        retriesDone: maxRetries - retries
      });
    } else {
      return Bacon.once(new Error(e));
    }
  }));
};

Bacon.Observable.prototype.skip = function(count) {
  return withDescription(this, "skip", count, this.withHandler(function(event) {
    if (!event.hasValue()) {
      return this.push(event);
    } else if (count > 0) {
      count--;
      return Bacon.more;
    } else {
      return this.push(event);
    }
  }));
};

Bacon.EventStream.prototype.skipUntil = function(starter) {
  var started;
  started = starter.take(1).map(true).toProperty(false);
  return withDescription(this, "skipUntil", starter, this.filter(started));
};

var __slice = [].slice;

Bacon.EventStream.prototype.skipWhile = function() {
  var args, f, ok;
  f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
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
};

Bacon.Observable.prototype.slidingWindow = function(n, minValues) {
  if (minValues == null) {
    minValues = 0;
  }
  return withDescription(this, "slidingWindow", n, minValues, this.scan([], (function(window, value) {
    return window.concat([value]).slice(-n);
  })).filter((function(values) {
    return values.length >= minValues;
  })));
};

var registerObs, spys;

Bacon.spy = function(spy) {
  return spys.push(spy);
};

spys = [];

registerObs = function(obs) {
  var spy, _i, _len;
  if (spys.length) {
    if (!registerObs.running) {
      try {
        registerObs.running = true;
        for (_i = 0, _len = spys.length; _i < _len; _i++) {
          spy = spys[_i];
          spy(obs);
        }
      } finally {
        delete registerObs.running;
      }
    }
  }
  return void 0;
};

Bacon.Property.prototype.startWith = function(value) {
  return withDescription(this, "startWith", value, this.scan(value, function(prev, next) {
    return next;
  }));
};

var __slice = [].slice;

Bacon.Observable.prototype.takeWhile = function() {
  var args, f;
  f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return convertArgsToFunction(this, f, args, function(f) {
    return withDescription(this, "takeWhile", f, this.withHandler(function(event) {
      if (event.filter(f)) {
        return this.push(event);
      } else {
        this.push(endEvent());
        return Bacon.noMore;
      }
    }));
  });
};

Bacon.EventStream.prototype.throttle = function(delay) {
  return withDescription(this, "throttle", delay, this.bufferWithTime(delay).map(function(values) {
    return values[values.length - 1];
  }));
};

Bacon.Property.prototype.throttle = function(delay) {
  return this.delayChanges("throttle", delay, function(changes) {
    return changes.throttle(delay);
  });
};

var __slice = [].slice;

Bacon.update = function() {
  var i, initial, lateBindFirst, patterns;
  initial = arguments[0], patterns = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  lateBindFirst = function(f) {
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return function(i) {
        return f.apply(null, [i].concat(args));
      };
    };
  };
  i = patterns.length - 1;
  while (i > 0) {
    if (!(patterns[i] instanceof Function)) {
      patterns[i] = (function(x) {
        return function() {
          return x;
        };
      })(patterns[i]);
    }
    patterns[i] = lateBindFirst(patterns[i]);
    i = i - 2;
  }
  return withDescription.apply(null, [Bacon, "update", initial].concat(__slice.call(patterns), [Bacon.when.apply(Bacon, patterns).scan(initial, (function(x, f) {
    return f(x);
  }))]));
};

var __slice = [].slice;

Bacon.zipAsArray = function() {
  var streams;
  streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (isArray(streams[0])) {
    streams = streams[0];
  }
  return withDescription.apply(null, [Bacon, "zipAsArray"].concat(__slice.call(streams), [Bacon.zipWith(streams, function() {
    var xs;
    xs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return xs;
  })]));
};

Bacon.zipWith = function() {
  var f, streams, _ref;
  f = arguments[0], streams = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (!_.isFunction(f)) {
    _ref = [f, streams[0]], streams = _ref[0], f = _ref[1];
  }
  streams = _.map((function(s) {
    return s.toEventStream();
  }), streams);
  return withDescription.apply(null, [Bacon, "zipWith", f].concat(__slice.call(streams), [Bacon.when(streams, f)]));
};

Bacon.Observable.prototype.zip = function(other, f) {
  if (f == null) {
    f = Array;
  }
  return withDescription(this, "zip", other, Bacon.zipWith([this, other], f));
};



if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return Bacon;
  });
  this.Bacon = Bacon;
} else if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
  module.exports = Bacon;
  Bacon.Bacon = Bacon;
} else {
  this.Bacon = Bacon;
}

// function wrapper
}).call(this);
