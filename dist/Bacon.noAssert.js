(function () {
    var Bacon, BufferingSource, ConsumingSource, Desc, Dispatcher, End, Error, Event, EventStream, Exception, Initial, Next, None, Observable, Property, PropertyDispatcher, Some, Source, UpdateBarrier, _, assert, assertArray, assertEventStream, assertFunction, assertNoArguments, assertObservable, assertString, cloneArray, convertArgsToFunction, describe, endEvent, eventIdCounter, eventMethods, findDeps, findHandlerMethods, former, idCounter, initialEvent, isArray, isFieldKey, isObservable, latter, makeFunction, makeFunctionArgs, makeFunction_, nextEvent, nop, partiallyApplied, recursionDepth, registerObs, toCombinator, toEvent, toFieldExtractor, toFieldKey, toOption, toSimpleExtractor, withDescription, withMethodCallSupport, hasProp = {}.hasOwnProperty, extend = function (child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key))
                    child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        }, slice = [].slice, bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments);
            };
        };
    Bacon = {
        toString: function () {
            return 'Bacon';
        }
    };
    Bacon.version = '<version>';
    Exception = (typeof global !== 'undefined' && global !== null ? global : this).Error;
    nop = function () {
    };
    latter = function (_, x) {
        return x;
    };
    former = function (x, _) {
        return x;
    };
    cloneArray = function (xs) {
        return xs.slice(0);
    };
    isArray = function (xs) {
        return xs instanceof Array;
    };
    isObservable = function (x) {
        return x instanceof Observable;
    };
    _ = {
        indexOf: Array.prototype.indexOf ? function (xs, x) {
            return xs.indexOf(x);
        } : function (xs, x) {
            var i, j, len, y;
            for (i = j = 0, len = xs.length; j < len; i = ++j) {
                y = xs[i];
                if (x === y) {
                    return i;
                }
            }
            return -1;
        },
        indexWhere: function (xs, f) {
            var i, j, len, y;
            for (i = j = 0, len = xs.length; j < len; i = ++j) {
                y = xs[i];
                if (f(y)) {
                    return i;
                }
            }
            return -1;
        },
        head: function (xs) {
            return xs[0];
        },
        always: function (x) {
            return function () {
                return x;
            };
        },
        negate: function (f) {
            return function (x) {
                return !f(x);
            };
        },
        empty: function (xs) {
            return xs.length === 0;
        },
        tail: function (xs) {
            return xs.slice(1, xs.length);
        },
        filter: function (f, xs) {
            var filtered, j, len, x;
            filtered = [];
            for (j = 0, len = xs.length; j < len; j++) {
                x = xs[j];
                if (f(x)) {
                    filtered.push(x);
                }
            }
            return filtered;
        },
        map: function (f, xs) {
            var j, len, results, x;
            results = [];
            for (j = 0, len = xs.length; j < len; j++) {
                x = xs[j];
                results.push(f(x));
            }
            return results;
        },
        each: function (xs, f) {
            var key, value;
            for (key in xs) {
                value = xs[key];
                f(key, value);
            }
            return void 0;
        },
        toArray: function (xs) {
            if (isArray(xs)) {
                return xs;
            } else {
                return [xs];
            }
        },
        contains: function (xs, x) {
            return _.indexOf(xs, x) !== -1;
        },
        id: function (x) {
            return x;
        },
        last: function (xs) {
            return xs[xs.length - 1];
        },
        all: function (xs, f) {
            var j, len, x;
            if (f == null) {
                f = _.id;
            }
            for (j = 0, len = xs.length; j < len; j++) {
                x = xs[j];
                if (!f(x)) {
                    return false;
                }
            }
            return true;
        },
        any: function (xs, f) {
            var j, len, x;
            if (f == null) {
                f = _.id;
            }
            for (j = 0, len = xs.length; j < len; j++) {
                x = xs[j];
                if (f(x)) {
                    return true;
                }
            }
            return false;
        },
        without: function (x, xs) {
            return _.filter(function (y) {
                return y !== x;
            }, xs);
        },
        remove: function (x, xs) {
            var i;
            i = _.indexOf(xs, x);
            if (i >= 0) {
                return xs.splice(i, 1);
            }
        },
        fold: function (xs, seed, f) {
            var j, len, x;
            for (j = 0, len = xs.length; j < len; j++) {
                x = xs[j];
                seed = f(seed, x);
            }
            return seed;
        },
        flatMap: function (f, xs) {
            return _.fold(xs, [], function (ys, x) {
                return ys.concat(f(x));
            });
        },
        cached: function (f) {
            var value;
            value = None;
            return function () {
                if (value === None) {
                    value = f();
                    f = void 0;
                }
                return value;
            };
        },
        isFunction: function (f) {
            return typeof f === 'function';
        },
        toString: function (obj) {
            var ex, internals, key, value;
            try {
                recursionDepth++;
                if (obj == null) {
                    return 'undefined';
                } else if (_.isFunction(obj)) {
                    return 'function';
                } else if (isArray(obj)) {
                    if (recursionDepth > 5) {
                        return '[..]';
                    }
                    return '[' + _.map(_.toString, obj).toString() + ']';
                } else if ((obj != null ? obj.toString : void 0) != null && obj.toString !== Object.prototype.toString) {
                    return obj.toString();
                } else if (typeof obj === 'object') {
                    if (recursionDepth > 5) {
                        return '{..}';
                    }
                    internals = function () {
                        var results;
                        results = [];
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
                            results.push(_.toString(key) + ':' + _.toString(value));
                        }
                        return results;
                    }();
                    return '{' + internals + '}';
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
    eventIdCounter = 0;
    Event = function () {
        function Event() {
            this.id = ++eventIdCounter;
        }
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
    Next = function (superClass) {
        extend(Next, superClass);
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
        Next.prototype.isNext = function () {
            return true;
        };
        Next.prototype.hasValue = function () {
            return true;
        };
        Next.prototype.value = function () {
            if (this.valueF instanceof Next) {
                this.valueInternal = this.valueF.value();
                this.valueF = void 0;
            } else if (this.valueF) {
                this.valueInternal = this.valueF();
                this.valueF = void 0;
            }
            return this.valueInternal;
        };
        Next.prototype.fmap = function (f) {
            var event, value;
            if (this.valueInternal) {
                value = this.valueInternal;
                return this.apply(function () {
                    return f(value);
                });
            } else {
                event = this;
                return this.apply(function () {
                    return f(event.value());
                });
            }
        };
        Next.prototype.apply = function (value) {
            return new Next(value);
        };
        Next.prototype.filter = function (f) {
            return f(this.value());
        };
        Next.prototype.toString = function () {
            return _.toString(this.value());
        };
        Next.prototype.log = function () {
            return this.value();
        };
        return Next;
    }(Event);
    Initial = function (superClass) {
        extend(Initial, superClass);
        function Initial() {
            return Initial.__super__.constructor.apply(this, arguments);
        }
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
    End = function (superClass) {
        extend(End, superClass);
        function End() {
            return End.__super__.constructor.apply(this, arguments);
        }
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
            return '<end>';
        };
        return End;
    }(Event);
    Error = function (superClass) {
        extend(Error, superClass);
        function Error(error) {
            this.error = error;
        }
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
            return '<error> ' + _.toString(this.error);
        };
        return Error;
    }(Event);
    Bacon.Event = Event;
    Bacon.Initial = Initial;
    Bacon.Next = Next;
    Bacon.End = End;
    Bacon.Error = Error;
    initialEvent = function (value) {
        return new Initial(value, true);
    };
    nextEvent = function (value) {
        return new Next(value, true);
    };
    endEvent = function () {
        return new End();
    };
    toEvent = function (x) {
        if (x instanceof Event) {
            return x;
        } else {
            return nextEvent(x);
        }
    };
    Bacon.noMore = ['<no-more>'];
    Bacon.more = ['<more>'];
    UpdateBarrier = Bacon.UpdateBarrier = function () {
        var afterTransaction, afters, aftersIndex, currentEventId, flush, flushDepsOf, flushWaiters, hasWaiters, inTransaction, rootEvent, waiterObs, waiters, whenDoneWith, wrappedSubscribe;
        rootEvent = void 0;
        waiterObs = [];
        waiters = {};
        afters = [];
        aftersIndex = 0;
        afterTransaction = function (f) {
            if (rootEvent) {
                return afters.push(f);
            } else {
                return f();
            }
        };
        whenDoneWith = function (obs, f) {
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
        flush = function () {
            while (waiterObs.length > 0) {
                flushWaiters(0);
            }
            return void 0;
        };
        flushWaiters = function (index) {
            var f, j, len, obs, obsId, obsWaiters;
            obs = waiterObs[index];
            obsId = obs.id;
            obsWaiters = waiters[obsId];
            waiterObs.splice(index, 1);
            delete waiters[obsId];
            flushDepsOf(obs);
            for (j = 0, len = obsWaiters.length; j < len; j++) {
                f = obsWaiters[j];
                f();
            }
            return void 0;
        };
        flushDepsOf = function (obs) {
            var dep, deps, index, j, len;
            deps = obs.internalDeps();
            for (j = 0, len = deps.length; j < len; j++) {
                dep = deps[j];
                flushDepsOf(dep);
                if (waiters[dep.id]) {
                    index = _.indexOf(waiterObs, dep);
                    flushWaiters(index);
                }
            }
            return void 0;
        };
        inTransaction = function (event, context, f, args) {
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
        currentEventId = function () {
            if (rootEvent) {
                return rootEvent.id;
            } else {
                return void 0;
            }
        };
        wrappedSubscribe = function (obs, sink) {
            var doUnsub, shouldUnsub, unsub, unsubd;
            unsubd = false;
            shouldUnsub = false;
            doUnsub = function () {
                return shouldUnsub = true;
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
            if (shouldUnsub) {
                doUnsub();
            }
            return unsub;
        };
        hasWaiters = function () {
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
    }();
    Source = function () {
        function Source(obs1, sync, lazy) {
            this.obs = obs1;
            this.sync = sync;
            this.lazy = lazy != null ? lazy : false;
            this.queue = [];
        }
        Source.prototype.subscribe = function (sink) {
            return this.obs.dispatcher.subscribe(sink);
        };
        Source.prototype.toString = function () {
            return this.obs.toString();
        };
        Source.prototype.markEnded = function () {
            return this.ended = true;
        };
        Source.prototype.consume = function () {
            if (this.lazy) {
                return { value: _.always(this.queue[0]) };
            } else {
                return this.queue[0];
            }
        };
        Source.prototype.push = function (x) {
            return this.queue = [x];
        };
        Source.prototype.mayHave = function () {
            return true;
        };
        Source.prototype.hasAtLeast = function () {
            return this.queue.length;
        };
        Source.prototype.flatten = true;
        return Source;
    }();
    ConsumingSource = function (superClass) {
        extend(ConsumingSource, superClass);
        function ConsumingSource() {
            return ConsumingSource.__super__.constructor.apply(this, arguments);
        }
        ConsumingSource.prototype.consume = function () {
            return this.queue.shift();
        };
        ConsumingSource.prototype.push = function (x) {
            return this.queue.push(x);
        };
        ConsumingSource.prototype.mayHave = function (c) {
            return !this.ended || this.queue.length >= c;
        };
        ConsumingSource.prototype.hasAtLeast = function (c) {
            return this.queue.length >= c;
        };
        ConsumingSource.prototype.flatten = false;
        return ConsumingSource;
    }(Source);
    BufferingSource = function (superClass) {
        extend(BufferingSource, superClass);
        function BufferingSource(obs) {
            BufferingSource.__super__.constructor.call(this, obs, true);
        }
        BufferingSource.prototype.consume = function () {
            var values;
            values = this.queue;
            this.queue = [];
            return {
                value: function () {
                    return values;
                }
            };
        };
        BufferingSource.prototype.push = function (x) {
            return this.queue.push(x.value());
        };
        BufferingSource.prototype.hasAtLeast = function () {
            return true;
        };
        return BufferingSource;
    }(Source);
    Source.isTrigger = function (s) {
        if (s instanceof Source) {
            return s.sync;
        } else {
            return s instanceof EventStream;
        }
    };
    Source.fromObservable = function (s) {
        if (s instanceof Source) {
            return s;
        } else if (s instanceof Property) {
            return new Source(s, false);
        } else {
            return new ConsumingSource(s, true);
        }
    };
    Desc = function () {
        function Desc(context1, method1, args1) {
            this.context = context1;
            this.method = method1;
            this.args = args1;
            this.cached = void 0;
        }
        Desc.prototype.deps = function () {
            return this.cached || (this.cached = findDeps([this.context].concat(this.args)));
        };
        Desc.prototype.apply = function (obs) {
            obs.desc = this;
            return obs;
        };
        Desc.prototype.toString = function () {
            return _.toString(this.context) + '.' + _.toString(this.method) + '(' + _.map(_.toString, this.args) + ')';
        };
        return Desc;
    }();
    describe = function () {
        var args, context, method;
        context = arguments[0], method = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        if ((context || method) instanceof Desc) {
            return context || method;
        } else {
            return new Desc(context, method, args);
        }
    };
    withDescription = function () {
        var desc, j, obs;
        desc = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), obs = arguments[j++];
        return describe.apply(null, desc).apply(obs);
    };
    findDeps = function (x) {
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
    withMethodCallSupport = function (wrapped) {
        return function () {
            var args, context, f, methodName;
            f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            if (typeof f === 'object' && args.length) {
                context = f;
                methodName = args[0];
                f = function () {
                    return context[methodName].apply(context, arguments);
                };
                args = args.slice(1);
            }
            return wrapped.apply(null, [f].concat(slice.call(args)));
        };
    };
    makeFunctionArgs = function (args) {
        args = Array.prototype.slice.call(args);
        return makeFunction_.apply(null, args);
    };
    partiallyApplied = function (f, applied) {
        return function () {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return f.apply(null, applied.concat(args));
        };
    };
    toSimpleExtractor = function (args) {
        return function (key) {
            return function (value) {
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
    toFieldExtractor = function (f, args) {
        var partFuncs, parts;
        parts = f.slice(1).split('.');
        partFuncs = _.map(toSimpleExtractor(args), parts);
        return function (value) {
            var j, len;
            for (j = 0, len = partFuncs.length; j < len; j++) {
                f = partFuncs[j];
                value = f(value);
            }
            return value;
        };
    };
    isFieldKey = function (f) {
        return typeof f === 'string' && f.length > 1 && f.charAt(0) === '.';
    };
    makeFunction_ = withMethodCallSupport(function () {
        var args, f;
        f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
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
    makeFunction = function (f, args) {
        return makeFunction_.apply(null, [f].concat(slice.call(args)));
    };
    convertArgsToFunction = function (obs, f, args, method) {
        var sampled;
        if (f instanceof Property) {
            sampled = f.sampledBy(obs, function (p, s) {
                return [
                    p,
                    s
                ];
            });
            return method.call(sampled, function (arg) {
                var p, s;
                p = arg[0], s = arg[1];
                return p;
            }).map(function (arg) {
                var p, s;
                p = arg[0], s = arg[1];
                return s;
            });
        } else {
            f = makeFunction(f, args);
            return method.call(obs, f);
        }
    };
    toCombinator = function (f) {
        var key;
        if (_.isFunction(f)) {
            return f;
        } else if (isFieldKey(f)) {
            key = toFieldKey(f);
            return function (left, right) {
                return left[key](right);
            };
        } else {
            throw new Exception('not a function or a field key: ' + f);
        }
    };
    toFieldKey = function (f) {
        return f.slice(1);
    };
    Some = function () {
        function Some(value1) {
            this.value = value1;
        }
        Some.prototype.getOrElse = function () {
            return this.value;
        };
        Some.prototype.get = function () {
            return this.value;
        };
        Some.prototype.filter = function (f) {
            if (f(this.value)) {
                return new Some(this.value);
            } else {
                return None;
            }
        };
        Some.prototype.map = function (f) {
            return new Some(f(this.value));
        };
        Some.prototype.forEach = function (f) {
            return f(this.value);
        };
        Some.prototype.isDefined = true;
        Some.prototype.toArray = function () {
            return [this.value];
        };
        Some.prototype.inspect = function () {
            return 'Some(' + this.value + ')';
        };
        Some.prototype.toString = function () {
            return this.inspect();
        };
        return Some;
    }();
    None = {
        getOrElse: function (value) {
            return value;
        },
        filter: function () {
            return None;
        },
        map: function () {
            return None;
        },
        forEach: function () {
        },
        isDefined: false,
        toArray: function () {
            return [];
        },
        inspect: function () {
            return 'None';
        },
        toString: function () {
            return this.inspect();
        }
    };
    toOption = function (v) {
        if (v instanceof Some || v === None) {
            return v;
        } else {
            return new Some(v);
        }
    };
    idCounter = 0;
    registerObs = function () {
    };
    Observable = function () {
        function Observable(desc) {
            this.id = ++idCounter;
            withDescription(desc, this);
            this.initialDesc = this.desc;
        }
        Observable.prototype.subscribe = function (sink) {
            return UpdateBarrier.wrappedSubscribe(this, sink);
        };
        Observable.prototype.subscribeInternal = function (sink) {
            return this.dispatcher.subscribe(sink);
        };
        Observable.prototype.onValue = function () {
            var f;
            f = makeFunctionArgs(arguments);
            return this.subscribe(function (event) {
                if (event.hasValue()) {
                    return f(event.value());
                }
            });
        };
        Observable.prototype.onValues = function (f) {
            return this.onValue(function (args) {
                return f.apply(null, args);
            });
        };
        Observable.prototype.onError = function () {
            var f;
            f = makeFunctionArgs(arguments);
            return this.subscribe(function (event) {
                if (event.isError()) {
                    return f(event.error);
                }
            });
        };
        Observable.prototype.onEnd = function () {
            var f;
            f = makeFunctionArgs(arguments);
            return this.subscribe(function (event) {
                if (event.isEnd()) {
                    return f();
                }
            });
        };
        Observable.prototype.name = function (name) {
            this._name = name;
            return this;
        };
        Observable.prototype.withDescription = function () {
            return describe.apply(null, arguments).apply(this);
        };
        Observable.prototype.toString = function () {
            if (this._name) {
                return this._name;
            } else {
                return this.desc.toString();
            }
        };
        Observable.prototype.internalDeps = function () {
            return this.initialDesc.deps();
        };
        return Observable;
    }();
    Observable.prototype.assign = Observable.prototype.onValue;
    Observable.prototype.forEach = Observable.prototype.onValue;
    Observable.prototype.inspect = Observable.prototype.toString;
    Bacon.Observable = Observable;
    Dispatcher = function () {
        function Dispatcher(_subscribe, _handleEvent) {
            this._subscribe = _subscribe;
            this._handleEvent = _handleEvent;
            this.subscribe = bind(this.subscribe, this);
            this.handleEvent = bind(this.handleEvent, this);
            this.subscriptions = [];
            this.queue = [];
            this.pushing = false;
            this.ended = false;
            this.prevError = void 0;
            this.unsubSrc = void 0;
        }
        Dispatcher.prototype.hasSubscribers = function () {
            return this.subscriptions.length > 0;
        };
        Dispatcher.prototype.removeSub = function (subscription) {
            return this.subscriptions = _.without(subscription, this.subscriptions);
        };
        Dispatcher.prototype.push = function (event) {
            if (event.isEnd()) {
                this.ended = true;
            }
            return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
        };
        Dispatcher.prototype.pushToSubscriptions = function (event) {
            var e, j, len, reply, sub, tmp;
            try {
                tmp = this.subscriptions;
                for (j = 0, len = tmp.length; j < len; j++) {
                    sub = tmp[j];
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
            return this.unsubSrc = void 0;
        };
        Dispatcher.prototype.subscribe = function (sink) {
            var subscription;
            if (this.ended) {
                sink(endEvent());
                return nop;
            } else {
                subscription = { sink: sink };
                this.subscriptions.push(subscription);
                if (this.subscriptions.length === 1) {
                    this.unsubSrc = this._subscribe(this.handleEvent);
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
    EventStream = function (superClass) {
        extend(EventStream, superClass);
        function EventStream(desc, subscribe, handler) {
            if (_.isFunction(desc)) {
                handler = subscribe;
                subscribe = desc;
                desc = [];
            }
            EventStream.__super__.constructor.call(this, desc);
            this.dispatcher = new Dispatcher(subscribe, handler);
            registerObs(this);
        }
        EventStream.prototype.toProperty = function (initValue_) {
            var disp, initValue;
            initValue = arguments.length === 0 ? None : toOption(function () {
                return initValue_;
            });
            disp = this.dispatcher;
            return new Property(describe(this, 'toProperty', initValue_), function (sink) {
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
        EventStream.prototype.withHandler = function (handler) {
            return new EventStream(describe(this, 'withHandler', handler), this.dispatcher.subscribe, handler);
        };
        return EventStream;
    }(Observable);
    Bacon.EventStream = EventStream;
    Bacon.never = function () {
        return new EventStream(describe(Bacon, 'never'), function (sink) {
            sink(endEvent());
            return nop;
        });
    };
    PropertyDispatcher = function (superClass) {
        extend(PropertyDispatcher, superClass);
        function PropertyDispatcher(property, subscribe, handleEvent) {
            this.property = property;
            this.subscribe = bind(this.subscribe, this);
            PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
            this.current = None;
            this.currentValueRootId = void 0;
            this.propertyEnded = false;
        }
        PropertyDispatcher.prototype.push = function (event) {
            if (event.isEnd()) {
                this.propertyEnded = true;
            }
            if (event.hasValue()) {
                this.current = new Some(event);
                this.currentValueRootId = UpdateBarrier.currentEventId();
            }
            return PropertyDispatcher.__super__.push.call(this, event);
        };
        PropertyDispatcher.prototype.maybeSubSource = function (sink, reply) {
            if (reply === Bacon.noMore) {
                return nop;
            } else if (this.propertyEnded) {
                sink(endEvent());
                return nop;
            } else {
                return Dispatcher.prototype.subscribe.call(this, sink);
            }
        };
        PropertyDispatcher.prototype.subscribe = function (sink) {
            var dispatchingId, initSent, reply, valId;
            initSent = false;
            reply = Bacon.more;
            if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
                dispatchingId = UpdateBarrier.currentEventId();
                valId = this.currentValueRootId;
                if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
                    UpdateBarrier.whenDoneWith(this.property, function (_this) {
                        return function () {
                            if (_this.currentValueRootId === valId) {
                                return sink(initialEvent(_this.current.get().value()));
                            }
                        };
                    }(this));
                    return this.maybeSubSource(sink, reply);
                } else {
                    UpdateBarrier.inTransaction(void 0, this, function () {
                        return reply = sink(initialEvent(this.current.get().value()));
                    }, []);
                    return this.maybeSubSource(sink, reply);
                }
            } else {
                return this.maybeSubSource(sink, reply);
            }
        };
        return PropertyDispatcher;
    }(Dispatcher);
    Property = function (superClass) {
        extend(Property, superClass);
        function Property(desc, subscribe, handler) {
            if (_.isFunction(desc)) {
                handler = subscribe;
                subscribe = desc;
                desc = [];
            }
            Property.__super__.constructor.call(this, desc);
            this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
            registerObs(this);
        }
        Property.prototype.changes = function () {
            return new EventStream(describe(this, 'changes'), function (_this) {
                return function (sink) {
                    return _this.dispatcher.subscribe(function (event) {
                        if (!event.isInitial()) {
                            return sink(event);
                        }
                    });
                };
            }(this));
        };
        Property.prototype.withHandler = function (handler) {
            return new Property(describe(this, 'withHandler', handler), this.dispatcher.subscribe, handler);
        };
        Property.prototype.toProperty = function () {
            return this;
        };
        Property.prototype.toEventStream = function () {
            return new EventStream(describe(this, 'toEventStream'), function (_this) {
                return function (sink) {
                    return _this.dispatcher.subscribe(function (event) {
                        if (event.isInitial()) {
                            event = event.toNext();
                        }
                        return sink(event);
                    });
                };
            }(this));
        };
        return Property;
    }(Observable);
    Bacon.Property = Property;
    Bacon.constant = function (value) {
        return new Property(describe(Bacon, 'constant', value), function (sink) {
            sink(initialEvent(value));
            sink(endEvent());
            return nop;
        });
    };
    Bacon.fromBinder = function (binder, eventTransformer) {
        if (eventTransformer == null) {
            eventTransformer = _.id;
        }
        return new EventStream(describe(Bacon, 'fromBinder', binder, eventTransformer), function (sink) {
            var shouldUnbind, unbind, unbinder, unbound;
            unbound = false;
            shouldUnbind = false;
            unbind = function () {
                if (!unbound) {
                    if (typeof unbinder !== 'undefined' && unbinder !== null) {
                        unbinder();
                        return unbound = true;
                    } else {
                        return shouldUnbind = true;
                    }
                }
            };
            unbinder = binder(function () {
                var args, event, j, len, reply, value;
                args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                value = eventTransformer.apply(this, args);
                if (!(isArray(value) && _.last(value) instanceof Event)) {
                    value = [value];
                }
                reply = Bacon.more;
                for (j = 0, len = value.length; j < len; j++) {
                    event = value[j];
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
    eventMethods = [
        [
            'addEventListener',
            'removeEventListener'
        ],
        [
            'addListener',
            'removeListener'
        ],
        [
            'on',
            'off'
        ],
        [
            'bind',
            'unbind'
        ]
    ];
    findHandlerMethods = function (target) {
        var j, len, methodPair, pair;
        for (j = 0, len = eventMethods.length; j < len; j++) {
            pair = eventMethods[j];
            methodPair = [
                target[pair[0]],
                target[pair[1]]
            ];
            if (methodPair[0] && methodPair[1]) {
                return methodPair;
            }
        }
        throw new Error('No suitable event methods in ' + target);
    };
    Bacon.fromEventTarget = function (target, eventName, eventTransformer) {
        var ref, sub, unsub;
        ref = findHandlerMethods(target), sub = ref[0], unsub = ref[1];
        return withDescription(Bacon, 'fromEvent', target, eventName, Bacon.fromBinder(function (handler) {
            sub.call(target, eventName, handler);
            return function () {
                return unsub.call(target, eventName, handler);
            };
        }, eventTransformer));
    };
    Bacon.fromEvent = Bacon.fromEventTarget;
    Bacon.Observable.prototype.take = function (count) {
        if (count <= 0) {
            return Bacon.never();
        }
        return withDescription(this, 'take', count, this.withHandler(function (event) {
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
    Bacon.Observable.prototype.first = function () {
        return withDescription(this, 'first', this.take(1));
    };
    if (typeof define !== 'undefined' && define !== null && define.amd != null) {
        define([], function () {
            return Bacon;
        });
        this.Bacon = Bacon;
    } else if (typeof module !== 'undefined' && module !== null && module.exports != null) {
        module.exports = Bacon;
        Bacon.Bacon = Bacon;
    } else {
        this.Bacon = Bacon;
    }
}.call(this));