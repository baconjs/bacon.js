(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Bacon = factory());
}(this, (function () { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function nop() { }
var isArray = Array.isArray || function (xs) { return xs instanceof Array; };
function isObservable(x) {
    return x && x._isObservable;
}

var Some = /** @class */ (function () {
    function Some(value) {
        this._isSome = true;
        this.isDefined = true;
        this.value = value;
    }
    Some.prototype.getOrElse = function (arg) { return this.value; };
    Some.prototype.get = function () { return this.value; };
    Some.prototype.filter = function (f) {
        if (f(this.value)) {
            return new Some(this.value);
        }
        else {
            return None;
        }
    };
    Some.prototype.map = function (f) {
        return new Some(f(this.value));
    };
    Some.prototype.forEach = function (f) {
        f(this.value);
    };
    Some.prototype.toArray = function () { return [this.value]; };
    Some.prototype.inspect = function () { return "Some(" + this.value + ")"; };
    Some.prototype.toString = function () { return this.inspect(); };
    return Some;
}());
var None = {
    _isNone: true,
    getOrElse: function (value) { return value; },
    get: function () { throw new Error("None.get()"); },
    filter: function () { return None; },
    map: function () { return None; },
    forEach: function () { },
    isDefined: false,
    toArray: function () { return []; },
    inspect: function () { return "None"; },
    toString: function () { return this.inspect(); }
};
function none() { return None; }
function toOption(v) {
    if (v && (v._isSome || v._isNone)) {
        return v;
    }
    else {
        return new Some(v);
    }
}

var _ = {
    indexOf: (function () {
        if (Array.prototype.indexOf) {
            return (function (xs, x) { return xs.indexOf(x); });
        }
        else {
            return (function (xs, x) {
                for (var i = 0, y; i < xs.length; i++) {
                    y = xs[i];
                    if (x === y) {
                        return i;
                    }
                }
                return -1;
            });
        }
    })(),
    indexWhere: function (xs, f) {
        for (var i = 0, y; i < xs.length; i++) {
            y = xs[i];
            if (f(y)) {
                return i;
            }
        }
        return -1;
    },
    head: function (xs) { return xs[0]; },
    always: function (x) { return function () { return x; }; },
    negate: function (f) { return function (x) { return !f(x); }; },
    empty: function (xs) { return xs.length === 0; },
    tail: function (xs) { return xs.slice(1, xs.length); },
    filter: function (f, xs) {
        var filtered = [];
        for (var i = 0, x; i < xs.length; i++) {
            x = xs[i];
            if (f(x)) {
                filtered.push(x);
            }
        }
        return filtered;
    },
    map: function (f, xs) {
        var result = [];
        for (var i = 0, x; i < xs.length; i++) {
            x = xs[i];
            result.push(f(x));
        }
        return result;
    },
    each: function (xs, f) {
        for (var key in xs) {
            if (Object.prototype.hasOwnProperty.call(xs, key)) {
                var value = xs[key];
                f(key, value);
            }
        }
    },
    toArray: function (xs) { return isArray(xs) ? xs : [xs]; },
    contains: function (xs, x) { return _.indexOf(xs, x) !== -1; },
    id: function (x) { return x; },
    last: function (xs) { return xs[xs.length - 1]; },
    all: function (xs, f) {
        if (f === void 0) { f = _.id; }
        for (var i = 0, x; i < xs.length; i++) {
            x = xs[i];
            if (!f(x)) {
                return false;
            }
        }
        return true;
    },
    any: function (xs, f) {
        if (f === void 0) { f = _.id; }
        for (var i = 0, x; i < xs.length; i++) {
            x = xs[i];
            if (f(x)) {
                return true;
            }
        }
        return false;
    },
    without: function (x, xs) {
        return _.filter((function (y) { return y !== x; }), xs);
    },
    remove: function (x, xs) {
        var i = _.indexOf(xs, x);
        if (i >= 0) {
            return xs.splice(i, 1);
        }
    },
    fold: function (xs, seed, f) {
        for (var i = 0, x; i < xs.length; i++) {
            x = xs[i];
            seed = f(seed, x);
        }
        return seed;
    },
    flatMap: function (f, xs) {
        return _.fold(xs, [], (function (ys, x) {
            return ys.concat(f(x));
        }));
    },
    cached: function (f) {
        var value = None;
        return function () {
            if ((typeof value !== "undefined" && value !== null) ? value._isNone : undefined) {
                value = f();
                f = undefined;
            }
            return value;
        };
    },
    bind: function (fn, me) {
        return function () { return fn.apply(me, arguments); };
    },
    isFunction: function (f) { return typeof f === "function"; },
    toFunction: function (f) {
        if (typeof f == "function") {
            return f;
        }
        return function (x) { return f; };
    },
    toString: function (obj) {
        var hasProp = {}.hasOwnProperty;
        try {
            recursionDepth++;
            if (obj == null) {
                return "undefined";
            }
            else if (_.isFunction(obj)) {
                return "function";
            }
            else if (isArray(obj)) {
                if (recursionDepth > 5) {
                    return "[..]";
                }
                return "[" + _.map(_.toString, obj).toString() + "]";
            }
            else if (((obj != null ? obj.toString : void 0) != null) && obj.toString !== Object.prototype.toString) {
                return obj.toString();
            }
            else if (typeof obj === "object") {
                if (recursionDepth > 5) {
                    return "{..}";
                }
                var results = [];
                for (var key in obj) {
                    if (!hasProp.call(obj, key))
                        continue;
                    var value = (function () {
                        try {
                            return obj[key];
                        }
                        catch (error) {
                            return error;
                        }
                    })();
                    results.push(_.toString(key) + ":" + _.toString(value));
                }
                return "{" + results + "}";
            }
            else {
                return obj;
            }
        }
        finally {
            recursionDepth--;
        }
    }
};
// TODO: move the rest of the functions as separate exports
function flip(f) {
    return function (a, b) { return f(b, a); };
}

var recursionDepth = 0;

var eventIdCounter = 0;
var Event = /** @class */ (function () {
    function Event() {
        this.id = ++eventIdCounter;
        this.isEvent = true;
        this._isEvent = true;
        this.isEnd = false;
        this.isInitial = false;
        this.isNext = false;
        this.isError = false;
        this.hasValue = false;
    }
    Event.prototype.filter = function (f) { return true; };
    Event.prototype.inspect = function () { return this.toString(); };
    Event.prototype.log = function () { return this.toString(); };
    Event.prototype.toNext = function () { return this; };
    return Event;
}());
var Value = /** @class */ (function (_super) {
    __extends(Value, _super);
    function Value(value) {
        var _this = _super.call(this) || this;
        _this.hasValue = true;
        if (value instanceof Event) {
            throw new Error$1("Wrapping an event inside other event");
        }
        _this.value = value;
        return _this;
    }
    Value.prototype.fmap = function (f) {
        return this.apply(f(this.value));
    };
    Value.prototype.filter = function (f) { return f(this.value); };
    Value.prototype.toString = function () { return _.toString(this.value); };
    //toString(): string { return "<value " + this.id + ">" + _.toString(this.value) }
    Value.prototype.log = function () { return this.value; };
    return Value;
}(Event));
var Next = /** @class */ (function (_super) {
    __extends(Next, _super);
    function Next(value) {
        var _this = _super.call(this, value) || this;
        _this.isNext = true;
        _this._isNext = true; // some compatibility stuff?
        return _this;
    }
    Next.prototype.apply = function (value) { return new Next(value); };
    return Next;
}(Value));
var Initial = /** @class */ (function (_super) {
    __extends(Initial, _super);
    function Initial(value) {
        var _this = _super.call(this, value) || this;
        _this.isInitial = true;
        _this._isInitial = true;
        return _this;
    }
    Initial.prototype.apply = function (value) { return new Initial(value); };
    Initial.prototype.toNext = function () { return new Next(this.value); };
    return Initial;
}(Value));
var NoValue = /** @class */ (function (_super) {
    __extends(NoValue, _super);
    function NoValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hasValue = false;
        return _this;
    }
    NoValue.prototype.fmap = function (f) {
        return this;
    };
    return NoValue;
}(Event));
var End = /** @class */ (function (_super) {
    __extends(End, _super);
    function End() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isEnd = true;
        return _this;
    }
    End.prototype.toString = function () { return "<end>"; };
    return End;
}(NoValue));
var Error$1 = /** @class */ (function (_super) {
    __extends(Error, _super);
    function Error(error) {
        var _this = _super.call(this) || this;
        _this.isError = true;
        _this.error = error;
        return _this;
    }
    Error.prototype.toString = function () {
        return "<error> " + _.toString(this.error);
    };
    return Error;
}(NoValue));
function initialEvent(value) { return new Initial(value); }
function nextEvent(value) { return new Next(value); }
function endEvent() { return new End(); }
function toEvent(x) {
    if (x && x._isEvent) {
        return x;
    }
    else {
        return nextEvent(x);
    }
}
function isEvent(e) {
    return e && e._isEvent;
}
function isError(e) {
    return e.isError;
}
function hasValue(e) {
    return e.hasValue;
}
function isEnd(e) {
    return e.isEnd;
}

var Reply;
(function (Reply) {
    Reply["more"] = "<more>";
    Reply["noMore"] = "<no-more>";
})(Reply || (Reply = {}));
var more = Reply.more;
var noMore = Reply.noMore;

var spies = [];
var running = false;
function registerObs(obs) {
    if (spies.length) {
        if (!running) {
            try {
                running = true;
                spies.forEach(function (spy) {
                    spy(obs);
                });
            }
            finally {
                running = false;
            }
        }
    }
}
var spy = (function (spy) { return spies.push(spy); });

var Desc = /** @class */ (function () {
    function Desc(context, method, args) {
        if (args === void 0) { args = []; }
        this._isDesc = true;
        //assert("context missing", context)
        //assert("method missing", method)
        //assert("args missing", args)
        this.context = context;
        this.method = method;
        this.args = args;
    }
    Desc.prototype.deps = function () {
        if (!this.cached) {
            this.cached = findDeps([this.context].concat(this.args));
        }
        return this.cached;
    };
    Desc.prototype.toString = function () {
        var args = _.map(_.toString, this.args);
        return _.toString(this.context) + "." + _.toString(this.method) + "(" + args + ")";
    };
    return Desc;
}());

function describe(context, method) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var ref = context || method;
    if (ref && ref._isDesc) {
        return context || method;
    }
    else {
        return new Desc(context, method, args);
    }
}
function findDeps(x) {
    if (isArray(x)) {
        return _.flatMap(findDeps, x);
    }
    else if (isObservable(x)) {
        return [x];
    }
    else if ((typeof x !== "undefined" && x !== null) ? x._isSource : undefined) {
        return [x.obs];
    }
    else {
        return [];
    }
}

var defaultScheduler = {
    setTimeout: function (f, d) { return setTimeout(f, d); },
    setInterval: function (f, i) { return setInterval(f, i); },
    clearInterval: function (id) { return clearInterval(id); },
    clearTimeout: function (id) { return clearTimeout(id); },
    now: function () { return new Date().getTime(); }
};
var Scheduler = {
    scheduler: defaultScheduler
};

var CompositeUnsubscribe = /** @class */ (function () {
    function CompositeUnsubscribe(ss) {
        if (ss === void 0) { ss = []; }
        this.unsubscribed = false;
        this.unsubscribe = _.bind(this.unsubscribe, this);
        this.unsubscribed = false;
        this.subscriptions = [];
        this.starting = [];
        for (var i = 0, s; i < ss.length; i++) {
            s = ss[i];
            this.add(s);
        }
    }
    CompositeUnsubscribe.prototype.add = function (subscription) {
        var _this = this;
        if (!this.unsubscribed) {
            var ended = false;
            var unsub = nop;
            this.starting.push(subscription);
            var unsubMe = function () {
                if (_this.unsubscribed) {
                    return;
                }
                ended = true;
                _this.remove(unsub);
                _.remove(subscription, _this.starting);
            };
            unsub = subscription(this.unsubscribe, unsubMe);
            if (!(this.unsubscribed || ended)) {
                this.subscriptions.push(unsub);
            }
            else {
                unsub();
            }
            _.remove(subscription, this.starting);
        }
    };
    CompositeUnsubscribe.prototype.remove = function (unsub) {
        if (this.unsubscribed) {
            return;
        }
        if ((_.remove(unsub, this.subscriptions)) !== undefined) {
            return unsub();
        }
    };
    CompositeUnsubscribe.prototype.unsubscribe = function () {
        if (this.unsubscribed) {
            return;
        }
        this.unsubscribed = true;
        var iterable = this.subscriptions;
        for (var i = 0; i < iterable.length; i++) {
            iterable[i]();
        }
        this.subscriptions = [];
        this.starting = [];
    };
    CompositeUnsubscribe.prototype.count = function () {
        if (this.unsubscribed) {
            return 0;
        }
        return this.subscriptions.length + this.starting.length;
    };
    CompositeUnsubscribe.prototype.empty = function () {
        return this.count() === 0;
    };
    return CompositeUnsubscribe;
}());

var Bacon = {
  toString: function () {
    return "Bacon";
  },

  _: _,
  Event: Event,
  Next: Next,
  Initial: Initial,
  Error: Error$1,
  End: End,
  noMore: noMore,
  more: more,
  Desc: Desc,
  spy: spy,
  setScheduler: function (newScheduler) {
    return Scheduler.scheduler = newScheduler;
  },
  getScheduler: function () {
    return Scheduler.scheduler;
  },
  CompositeUnsubscribe: CompositeUnsubscribe,
  version: '<version>'
};

Bacon.Bacon = Bacon;

function assert(message, condition) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEventStream(event) {
    if (!(event != null ? event._isEventStream : void 0)) {
        throw new Error("not an EventStream : " + event);
    }
}
function assertObservable(observable) {
    if (!(observable != null ? observable._isObservable : void 0)) {
        throw new Error("not an Observable : " + observable);
    }
}
function assertFunction(f) {
    return assert("not a function : " + f, _.isFunction(f));
}
function assertArray(xs) {
    if (!isArray(xs)) {
        throw new Error("not an array : " + xs);
    }
}
function assertNoArguments(args) {
    return assert("no arguments supported", args.length === 0);
}

var rootEvent = undefined;
var waiterObs = [];
var waiters = {};
var aftersStack = [];
var aftersStackHeight = 0;
var flushed = {};
var processingAfters = false;
function toString() {
    return _.toString({ rootEvent: rootEvent, processingAfters: processingAfters, waiterObs: waiterObs, waiters: waiters, aftersStack: aftersStack, aftersStackHeight: aftersStackHeight, flushed: flushed });
}
function ensureStackHeight(h) {
    if (h <= aftersStackHeight)
        return;
    if (!aftersStack[h - 1]) {
        aftersStack[h - 1] = [[], 0];
    }
    aftersStackHeight = h;
}
function isInTransaction() {
    return rootEvent !== undefined;
}
function soonButNotYet(obs, f) {
    if (rootEvent) {
        // If in transaction -> perform within transaction
        //console.log('in tx')
        whenDoneWith(obs, f);
    }
    else {
        // Otherwise -> perform with timeout
        //console.log('with timeout')
        Scheduler.scheduler.setTimeout(f, 0);
    }
}
function afterTransaction(obs, f) {
    if (rootEvent || processingAfters) {
        ensureStackHeight(1);
        var stackIndexForThisObs = 0;
        while (stackIndexForThisObs < aftersStackHeight - 1) {
            if (containsObs(obs, aftersStack[stackIndexForThisObs][0])) {
                // this observable is already being processed at this stack index -> use this index
                break;
            }
            stackIndexForThisObs++;
        }
        var listFromStack = aftersStack[stackIndexForThisObs][0];
        listFromStack.push([obs, f]);
        if (!rootEvent) {
            processAfters(); // wouldn't be called otherwise
        }
    }
    else {
        return f();
    }
}
function containsObs(obs, aftersList) {
    for (var i = 0; i < aftersList.length; i++) {
        if (aftersList[i][0].id == obs.id)
            return true;
    }
    return false;
}
function processAfters() {
    var stackSizeAtStart = aftersStackHeight;
    if (!stackSizeAtStart)
        return;
    var isRoot = !processingAfters;
    processingAfters = true;
    try {
        while (aftersStackHeight >= stackSizeAtStart) { // to prevent sinking to levels started by others
            var topOfStack = aftersStack[aftersStackHeight - 1];
            if (!topOfStack)
                throw new Error("Unexpected stack top: " + topOfStack);
            var topAfters = topOfStack[0], index = topOfStack[1];
            if (index < topAfters.length) {
                var _a = topAfters[index], after = _a[1];
                topOfStack[1]++; // increase index already here to indicate that this level is being processed
                ensureStackHeight(aftersStackHeight + 1); // to ensure there's a new level for recursively added afters
                var callSuccess = false;
                try {
                    after();
                    callSuccess = true;
                    while (aftersStackHeight > stackSizeAtStart && aftersStack[aftersStackHeight - 1][0].length == 0) {
                        aftersStackHeight--;
                    }
                }
                finally {
                    if (!callSuccess) {
                        aftersStack = [];
                        aftersStackHeight = 0; // reset state to prevent stale updates after error
                    }
                }
            }
            else {
                topOfStack[0] = [];
                topOfStack[1] = 0; // reset this level
                break;
            }
        }
    }
    finally {
        if (isRoot)
            processingAfters = false;
    }
}
function whenDoneWith(obs, f) {
    if (rootEvent) {
        var obsWaiters = waiters[obs.id];
        if (obsWaiters === undefined) {
            obsWaiters = waiters[obs.id] = [f];
            return waiterObs.push(obs);
        }
        else {
            return obsWaiters.push(f);
        }
    }
    else {
        return f();
    }
}
function flush() {
    while (waiterObs.length > 0) {
        flushWaiters(0, true);
    }
    flushed = {};
}
function flushWaiters(index, deps) {
    var obs = waiterObs[index];
    var obsId = obs.id;
    var obsWaiters = waiters[obsId];
    waiterObs.splice(index, 1);
    delete waiters[obsId];
    if (deps && waiterObs.length > 0) {
        flushDepsOf(obs);
    }
    for (var i = 0, f; i < obsWaiters.length; i++) {
        f = obsWaiters[i];
        f();
    }
}
function flushDepsOf(obs) {
    if (flushed[obs.id])
        return;
    var deps = obs.internalDeps();
    for (var i = 0, dep; i < deps.length; i++) {
        dep = deps[i];
        flushDepsOf(dep);
        if (waiters[dep.id]) {
            var index = _.indexOf(waiterObs, dep);
            flushWaiters(index, false);
        }
    }
    flushed[obs.id] = true;
}
function inTransaction(event, context, f, args) {
    if (rootEvent) {
        //console.log("in tx")
        return f.apply(context, args);
    }
    else {
        //console.log("start tx")
        rootEvent = event;
        try {
            var result = f.apply(context, args);
            //console.log("done with tx")
            flush();
        }
        finally {
            rootEvent = undefined;
            processAfters();
        }
        return result;
    }
}
function currentEventId() {
    return rootEvent ? rootEvent.id : undefined;
}
function wrappedSubscribe(obs, subscribe, sink) {
    assertFunction(sink);
    var unsubd = false;
    var shouldUnsub = false;
    var doUnsub = function () {
        shouldUnsub = true;
    };
    var unsub = function () {
        unsubd = true;
        doUnsub();
    };
    doUnsub = subscribe(function (event) {
        return afterTransaction(obs, function () {
            if (!unsubd) {
                var reply = sink(event);
                if (reply === noMore) {
                    return unsub();
                }
            }
        });
    });
    if (shouldUnsub) {
        doUnsub();
    }
    return unsub;
}
function hasWaiters() { return waiterObs.length > 0; }
var UpdateBarrier = { toString: toString, whenDoneWith: whenDoneWith, hasWaiters: hasWaiters, inTransaction: inTransaction, currentEventId: currentEventId, wrappedSubscribe: wrappedSubscribe, afterTransaction: afterTransaction, soonButNotYet: soonButNotYet, isInTransaction: isInTransaction };

function withStateMachine(initState, f, src) {
    return src.transform(withStateMachineT(initState, f), new Desc(src, "withStateMachine", [initState, f]));
}
function withStateMachineT(initState, f) {
    var state = initState;
    return function (event, sink) {
        var fromF = f(state, event);
        var newState = fromF[0], outputs = fromF[1];
        state = newState;
        var reply = Reply.more;
        for (var i = 0; i < outputs.length; i++) {
            var output = outputs[i];
            reply = sink(output);
            if (reply === Reply.noMore) {
                return reply;
            }
        }
        return reply;
    };
}

function equals(a, b) { return a === b; }
function isNone(object) {
    return ((typeof object !== "undefined" && object !== null) ? object._isNone : false);
}

function skipDuplicates(src, isEqual) {
    if (isEqual === void 0) { isEqual = equals; }
    var desc = new Desc(src, "skipDuplicates", []);
    return withStateMachine(none(), function (prev, event) {
        if (!hasValue(event)) {
            return [prev, [event]];
        }
        else if (event.isInitial || isNone(prev) || !isEqual(prev.get(), event.value)) {
            return [new Some(event.value), [event]];
        }
        else {
            return [prev, []];
        }
    }, src).withDesc(desc);
}

function take(count, src, desc) {
    return src.transform(takeT(count), desc || new Desc(src, "take", [count]));
}
function takeT(count) {
    return function (e, sink) {
        if (!e.hasValue) {
            return sink(e);
        }
        else {
            count--;
            if (count > 0) {
                return sink(e);
            }
            else {
                if (count === 0) {
                    sink(e);
                }
                sink(endEvent());
                return noMore;
            }
        }
    };
}

function log(args, src) {
    src.subscribe(function (event) {
        if (typeof console !== "undefined" && typeof console.log === "function") {
            console.log.apply(console, args.concat([event.log()]));
        }
    });
}

function doLogT(args) {
    return function (event, sink) {
        if (typeof console !== "undefined" && console !== null && typeof console.log === "function") {
            console.log.apply(console, args.concat([event.log()]));
        }
        return sink(event);
    };
}

function doErrorT(f) {
    return function (event, sink) {
        if (isError(event)) {
            f(event.error);
        }
        return sink(event);
    };
}

function doActionT(f) {
    return function (event, sink) {
        if (hasValue(event)) {
            f(event.value);
        }
        return sink(event);
    };
}

function doEndT(f) {
    return function (event, sink) {
        if (isEnd(event)) {
            f();
        }
        return sink(event);
    };
}

function scan(src, seed, f) {
    var resultProperty;
    var acc = seed;
    var initHandled = false;
    var subscribe = function (sink) {
        var initSent = false;
        var unsub = nop;
        var reply = more;
        var sendInit = function () {
            if (!initSent) {
                initSent = initHandled = true;
                reply = sink(new Initial(acc));
                if (reply === noMore) {
                    unsub();
                    unsub = nop;
                }
            }
            return reply;
        };
        unsub = src.subscribeInternal(function (event) {
            if (hasValue(event)) {
                if (initHandled && event.isInitial) {
                    //console.log "skip INITIAL"
                    return more; // init already sent, skip this one
                }
                else {
                    if (!event.isInitial) {
                        sendInit();
                    }
                    initSent = initHandled = true;
                    var prev = acc;
                    var next = f(prev, event.value);
                    //console.log prev , ",", event.value, "->", next
                    acc = next;
                    return sink(event.apply(next));
                }
            }
            else {
                if (event.isEnd) {
                    reply = sendInit();
                }
                if (reply !== noMore) {
                    return sink(event);
                }
            }
        });
        UpdateBarrier.whenDoneWith(resultProperty, sendInit);
        return unsub;
    };
    return resultProperty = new Property(new Desc(src, "scan", [seed, f]), subscribe);
}

function mapEndT(f) {
    var theF = _.toFunction(f);
    return function (event, sink) {
        if (isEnd(event)) {
            sink(nextEvent(theF(event)));
            sink(endEvent());
            return noMore;
        }
        else {
            return sink(event);
        }
    };
}

function mapErrorT(f) {
    var theF = _.toFunction(f);
    return function (event, sink) {
        if (isError(event)) {
            return sink(nextEvent(theF(event.error)));
        }
        else {
            return sink(event);
        }
    };
}

function skipErrors(src) {
    return src.transform(function (event, sink) {
        if (isError(event)) {
            return more;
        }
        else {
            return sink(event);
        }
    }, new Desc(src, "skipErrors", []));
}

function last(src) {
    var lastEvent;
    return src.transform(function (event, sink) {
        if (isEnd(event)) {
            if (lastEvent) {
                sink(lastEvent);
            }
            sink(endEvent());
            return noMore;
        }
        else if (hasValue(event)) {
            lastEvent = event;
        }
        else {
            sink(event);
        }
    }).withDesc(new Desc(src, "last", []));
}

function streamSubscribeToPropertySubscribe(initValue, streamSubscribe) {
    //assertFunction(streamSubscribe)
    return function (sink) {
        var initSent = false;
        var subbed = false;
        var unsub = nop;
        var reply = more;
        var sendInit = function () {
            if (!initSent) {
                return initValue.forEach(function (value) {
                    initSent = true;
                    reply = sink(new Initial(value));
                    if (reply === noMore) {
                        unsub();
                        unsub = nop;
                        return nop;
                    }
                });
            }
        };
        unsub = streamSubscribe(function (event) {
            if (event instanceof Value) {
                if (event.isInitial && !subbed) {
                    initValue = new Some(event.value);
                    return more;
                }
                else {
                    if (!event.isInitial) {
                        sendInit();
                    }
                    initSent = true;
                    initValue = new Some(event.value);
                    return sink(event);
                }
            }
            else {
                if (event.isEnd) {
                    reply = sendInit();
                }
                if (reply !== noMore) {
                    return sink(event);
                }
            }
        });
        subbed = true;
        sendInit();
        return unsub;
    };
}

function propertyFromStreamSubscribe(desc, subscribe) {
    assertFunction(subscribe);
    return new Property(desc, streamSubscribeToPropertySubscribe(none(), subscribe));
}

function once(value) {
    var s = new EventStream(new Desc(Bacon, "once", [value]), function (sink) {
        UpdateBarrier.soonButNotYet(s, function () {
            sink(toEvent(value));
            sink(endEvent());
        });
        return nop;
    });
    return s;
}
Bacon.once = once;

function flatMap_(f_, src, params) {
    if (params === void 0) { params = {}; }
    var f = _.toFunction(f_);
    var root = src;
    var rootDep = [root];
    var childDeps = [];
    var isProperty$$1 = src._isProperty;
    var ctor = (isProperty$$1 ? propertyFromStreamSubscribe : newEventStream);
    var initialSpawned = false;
    var desc = params.desc || new Desc(src, "flatMap_", [f]);
    var result = ctor(desc, function (sink) {
        var composite = new CompositeUnsubscribe();
        var queue = [];
        function spawn(event) {
            if (isProperty$$1 && event.isInitial) {
                if (initialSpawned) {
                    return more;
                }
                initialSpawned = true;
            }
            var child = makeObservable(f(event));
            childDeps.push(child);
            return composite.add(function (unsubAll, unsubMe) {
                return child.subscribeInternal(function (event) {
                    if (event.isEnd) {
                        _.remove(child, childDeps);
                        checkQueue();
                        checkEnd(unsubMe);
                        return noMore;
                    }
                    else {
                        event = event.toNext(); // To support Property as the spawned stream
                        var reply = sink(event);
                        if (reply === noMore) {
                            unsubAll();
                        }
                        return reply;
                    }
                });
            });
        }
        function checkQueue() {
            var event = queue.shift();
            if (event) {
                spawn(event);
            }
        }
        function checkEnd(unsub) {
            unsub();
            if (composite.empty()) {
                return sink(endEvent());
            }
            return more;
        }
        composite.add(function (__, unsubRoot) {
            return root.subscribeInternal(function (event) {
                if (event.isEnd) {
                    return checkEnd(unsubRoot);
                }
                else if (event.isError && !params.mapError) {
                    return sink(event);
                }
                else if (params.firstOnly && composite.count() > 1) {
                    return more;
                }
                else {
                    if (composite.unsubscribed) {
                        return noMore;
                    }
                    if (params.limit && composite.count() > params.limit) {
                        return queue.push(event);
                    }
                    else {
                        return spawn(event);
                    }
                }
            });
        });
        return composite.unsubscribe;
    });
    result.internalDeps = function () {
        if (childDeps.length) {
            return rootDep.concat(childDeps);
        }
        else {
            return rootDep;
        }
    };
    return result;
}
function handleEventValueWith(f) {
    if (typeof f == "function") {
        return (function (event) { return f(event.value); });
    }
    return (function (event) { return f; });
}
function makeObservable(x) {
    if (isObservable(x)) {
        return x;
    }
    else {
        return once(x);
    }
}

function flatMapEvent(src, f) {
    return flatMap_(f, src, {
        mapError: true,
        desc: new Desc(src, "flatMapEvent", [f])
    });
}

function endAsValue(src) {
    return src.transform(function (event, sink) {
        if (isEnd(event)) {
            sink(nextEvent({}));
            sink(endEvent());
        }
    });
}

function endOnError(src, predicate) {
    if (predicate === void 0) { predicate = function (x) { return true; }; }
    return src.transform(function (event, sink) {
        if (isError(event) && predicate(event.error)) {
            sink(event);
            return sink(endEvent());
        }
        else {
            return sink(event);
        }
    }, new Desc(src, "endOnError", []));
}

var Source = /** @class */ (function () {
    function Source(obs, sync) {
        this._isSource = true;
        this.flatten = true;
        this.ended = false;
        this.obs = obs;
        this.sync = sync;
    }
    Source.prototype.subscribe = function (sink) {
        return this.obs.subscribeInternal(sink);
    };
    Source.prototype.toString = function () {
        return this.obs.toString();
    };
    Source.prototype.markEnded = function () {
        this.ended = true;
    };
    Source.prototype.mayHave = function (count) { return true; };
    return Source;
}());
var DefaultSource = /** @class */ (function (_super) {
    __extends(DefaultSource, _super);
    function DefaultSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultSource.prototype.consume = function () {
        return this.value;
    };
    DefaultSource.prototype.push = function (x) {
        this.value = x;
    };
    DefaultSource.prototype.hasAtLeast = function (c) {
        return !!this.value;
    };
    return DefaultSource;
}(Source));
var ConsumingSource = /** @class */ (function (_super) {
    __extends(ConsumingSource, _super);
    function ConsumingSource(obs, sync) {
        var _this = _super.call(this, obs, sync) || this;
        _this.flatten = false;
        _this.queue = [];
        return _this;
    }
    ConsumingSource.prototype.consume = function () {
        return this.queue.shift();
    };
    ConsumingSource.prototype.push = function (x) {
        return this.queue.push(x);
    };
    ConsumingSource.prototype.mayHave = function (count) {
        return !this.ended || this.queue.length >= count;
    };
    ConsumingSource.prototype.hasAtLeast = function (count) {
        return this.queue.length >= count;
    };
    return ConsumingSource;
}(Source));
var BufferingSource = /** @class */ (function (_super) {
    __extends(BufferingSource, _super);
    function BufferingSource(obs) {
        var _this = _super.call(this, obs, true) || this;
        _this.queue = [];
        return _this;
    }
    BufferingSource.prototype.consume = function () {
        var values = this.queue;
        this.queue = [];
        return {
            value: values
        };
    };
    BufferingSource.prototype.push = function (x) {
        return this.queue.push(x.value);
    };
    BufferingSource.prototype.hasAtLeast = function (count) {
        return true;
    };
    return BufferingSource;
}(Source));
function isTrigger(s) {
    if (s == null)
        return false;
    if (s._isSource) {
        return s.sync;
    }
    else {
        return s._isEventStream;
    }
}
function fromObservable(s) {
    if (s != null && s._isSource) {
        return s;
    }
    else if (s != null && s._isProperty) {
        return new DefaultSource(s, false);
    }
    else {
        return new ConsumingSource(s, true);
    }
}

function never() {
    return new EventStream(describe(Bacon, "never"), function (sink) {
        sink(endEvent());
        return nop;
    });
}
Bacon.never = never;

function when() {
    var patterns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        patterns[_i] = arguments[_i];
    }
    return when_(newEventStream, patterns);
}
function whenP() {
    var patterns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        patterns[_i] = arguments[_i];
    }
    return when_(propertyFromStreamSubscribe, patterns);
}
function when_(ctor, patterns) {
    if (patterns.length === 0) {
        return never();
    }
    var _a = processRawPatterns(extractRawPatterns(patterns)), sources = _a[0], ixPats = _a[1];
    if (!sources.length) {
        return never();
    }
    var needsBarrier = (_.any(sources, function (s) { return s.flatten; })) && containsDuplicateDeps(_.map((function (s) { return s.obs; }), sources));
    var desc = new Desc(Bacon, "when", Array.prototype.slice.call(patterns));
    var resultStream = ctor(desc, function (sink) {
        var triggers = [];
        var ends = false;
        function match(p) {
            for (var i = 0; i < p.ixs.length; i++) {
                var ix = p.ixs[i];
                if (!sources[ix.index].hasAtLeast(ix.count)) {
                    return false;
                }
            }
            return true;
        }
        function cannotMatch(p) {
            for (var i = 0; i < p.ixs.length; i++) {
                var ix = p.ixs[i];
                if (!sources[ix.index].mayHave(ix.count)) {
                    return true;
                }
            }
            return false;
        }
        function nonFlattened(trigger) { return !trigger.source.flatten; }
        function part(source) {
            return function (unsubAll) {
                function flushLater() {
                    return UpdateBarrier.whenDoneWith(resultStream, flush);
                }
                function flushWhileTriggers() {
                    var trigger;
                    if ((trigger = triggers.pop()) !== undefined) {
                        var reply = Reply.more;
                        for (var i = 0, p; i < ixPats.length; i++) {
                            p = ixPats[i];
                            if (match(p)) {
                                var values = [];
                                for (var j = 0; j < p.ixs.length; j++) {
                                    var event = sources[p.ixs[j].index].consume();
                                    if (!event)
                                        throw new Error("Event was undefined");
                                    values.push(event.value);
                                }
                                //console.log("flushing values", values)
                                var applied = p.f.apply(null, values);
                                //console.log('sinking', applied)
                                reply = sink((trigger).e.apply(applied));
                                if (triggers.length) {
                                    triggers = _.filter(nonFlattened, triggers);
                                }
                                if (reply === Reply.noMore) {
                                    return reply;
                                }
                                else {
                                    return flushWhileTriggers();
                                }
                            }
                        }
                    }
                    return Reply.more;
                }
                function flush() {
                    //console.log "flushing", _.toString(resultStream)
                    var reply = flushWhileTriggers();
                    if (ends) {
                        //console.log "ends detected"
                        if (_.all(sources, cannotSync) || _.all(ixPats, cannotMatch)) {
                            //console.log "actually ending"
                            reply = Reply.noMore;
                            sink(endEvent());
                        }
                    }
                    if (reply === Reply.noMore) {
                        unsubAll();
                    }
                }
                return source.subscribe(function (e) {
                    if (e.isEnd) {
                        //console.log "got end"
                        ends = true;
                        source.markEnded();
                        flushLater();
                    }
                    else if (e.isError) {
                        var reply = sink(e);
                    }
                    else {
                        var valueEvent = e;
                        //console.log "got value", e.value
                        source.push(valueEvent);
                        if (source.sync) {
                            //console.log "queuing", e.toString(), _.toString(resultStream)
                            triggers.push({ source: source, e: valueEvent });
                            if (needsBarrier || UpdateBarrier.hasWaiters()) {
                                flushLater();
                            }
                            else {
                                flush();
                            }
                        }
                    }
                    if (reply === noMore) {
                        unsubAll();
                    }
                    return reply || more;
                });
            };
        }
        return new CompositeUnsubscribe(_.map(part, sources)).unsubscribe;
    });
    return resultStream;
}
function processRawPatterns(rawPatterns) {
    var sources = [];
    var pats = [];
    for (var i = 0; i < rawPatterns.length; i++) {
        var _a = rawPatterns[i], patSources = _a[0], f = _a[1];
        var pat = { f: f, ixs: [] };
        var triggerFound = false;
        for (var j = 0, s; j < patSources.length; j++) {
            s = patSources[j];
            var index = _.indexOf(sources, s);
            if (!triggerFound) {
                triggerFound = isTrigger(s);
            }
            if (index < 0) {
                sources.push(s);
                index = sources.length - 1;
            }
            for (var k = 0; k < pat.ixs.length; k++) {
                var ix = pat.ixs[k];
                if (ix.index === index) {
                    ix.count++;
                }
            }
            pat.ixs.push({ index: index, count: 1 });
        }
        if (patSources.length > 0 && !triggerFound) {
            throw new Error("At least one EventStream required, none found in " + patSources);
        }
        if (patSources.length > 0) {
            pats.push(pat);
        }
    }
    return [_.map(fromObservable, sources), pats];
}
function extractLegacyPatterns(sourceArgs) {
    var i = 0;
    var len = sourceArgs.length;
    var rawPatterns = [];
    while (i < len) {
        var patSources = _.toArray(sourceArgs[i++]);
        var f = _.toFunction(sourceArgs[i++]);
        rawPatterns.push([patSources, f]);
    }
    var usage = "when: expecting arguments in the form (Observable+,function)+";
    assert(usage, (len % 2 === 0));
    return rawPatterns;
}
function isTypedOrRawPattern(pattern) {
    return (pattern instanceof Array) && (!isObservable(pattern[pattern.length - 1]));
}
function isRawPattern(pattern) {
    return pattern[0] instanceof Array;
}
function extractRawPatterns(patterns) {
    var rawPatterns = [];
    for (var i = 0; i < patterns.length; i++) {
        var pattern = patterns[i];
        if (!isTypedOrRawPattern(pattern)) {
            // Fallback to legacy patterns
            return extractLegacyPatterns(patterns);
        }
        if (isRawPattern(pattern)) {
            rawPatterns.push([pattern[0], _.toFunction(pattern[1])]);
        }
        else { // typed pattern, then
            var sources = pattern.slice(0, pattern.length - 1);
            var f = _.toFunction(pattern[pattern.length - 1]);
            rawPatterns.push([sources, f]);
        }
    }
    return rawPatterns;
}
function containsDuplicateDeps(observables, state) {
    if (state === void 0) { state = []; }
    function checkObservable(obs) {
        if (_.contains(state, obs)) {
            return true;
        }
        else {
            var deps = obs.internalDeps();
            if (deps.length) {
                state.push(obs);
                return _.any(deps, checkObservable);
            }
            else {
                state.push(obs);
                return false;
            }
        }
    }
    return _.any(observables, checkObservable);
}
function cannotSync(source) {
    return !source.sync || source.ended;
}
Bacon.when = when;

function withLatestFromE(sampler, samplee, f) {
    var result = when([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true), flip(f)]);
    return result.withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]));
}
function withLatestFromP(sampler, samplee, f) {
    var result = whenP([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true), flip(f)]);
    return result.withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]));
}
function withLatestFrom(sampler, samplee, f) {
    if (sampler instanceof Property) {
        return withLatestFromP(sampler, samplee, f);
    }
    else if (sampler instanceof EventStream) {
        return withLatestFromE(sampler, samplee, f);
    }
    else {
        throw new Error("Unknown observable: " + sampler);
    }
}

function map(src, f) {
    if (f instanceof Property) {
        return withLatestFrom(src, f, function (a, b) { return b; });
    }
    return src.transform(mapT(f), new Desc(src, "map", [f]));
}
function mapT(f) {
    var theF = _.toFunction(f);
    return function (e, sink) {
        return sink(e.fmap(theF));
    };
}

function constant(value) {
    return new Property(new Desc(Bacon, "constant", [value]), function (sink) {
        sink(initialEvent(value));
        sink(endEvent());
        return nop;
    });
}
Bacon.constant = constant;

function argumentsToObservables(args) {
    args = Array.prototype.slice.call(args);
    return _.flatMap(singleToObservables, args);
}
function singleToObservables(x) {
    if (isObservable(x)) {
        return [x];
    }
    else if (isArray(x)) {
        return argumentsToObservables(x);
    }
    else {
        return [constant(x)];
    }
}
function argumentsToObservablesAndFunction(args) {
    if (_.isFunction(args[0])) {
        return [argumentsToObservables(Array.prototype.slice.call(args, 1)), args[0]];
    }
    else {
        return [argumentsToObservables(Array.prototype.slice.call(args, 0, args.length - 1)), _.last(args)];
    }
}

function groupSimultaneous() {
    var streams = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        streams[_i] = arguments[_i];
    }
    return groupSimultaneous_(argumentsToObservables(streams));
}
// TODO: type is not exactly correct, because different inputs may have different types.
// Result values are arrays where each element is the list from each input observable. Type this.
function groupSimultaneous_(streams, options) {
    var sources = _.map(function (stream) { return new BufferingSource(stream); }, streams);
    var ctor = function (desc, subscribe) { return new EventStream(desc, subscribe, undefined, options); };
    return when_(ctor, [sources, (function () {
            var xs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                xs[_i] = arguments[_i];
            }
            return xs;
        })]).withDesc(new Desc(Bacon, "groupSimultaneous", streams));
}
Bacon.groupSimultaneous = groupSimultaneous;

function awaiting(src, other) {
    return groupSimultaneous_([src, other], allowSync)
        .map(function (values) { return values[1].length === 0; })
        .toProperty(false)
        .skipDuplicates()
        .withDesc(new Desc(src, "awaiting", [other]));
}

function combineAsArray() {
    var streams = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        streams[_i] = arguments[_i];
    }
    streams = argumentsToObservables(streams);
    if (streams.length) {
        var sources = [];
        for (var i = 0; i < streams.length; i++) {
            var stream = (isObservable(streams[i])
                ? streams[i]
                : constant(streams[i]));
            sources.push(wrap(stream));
        }
        return whenP([sources, function () {
                var xs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    xs[_i] = arguments[_i];
                }
                return xs;
            }]).withDesc(new Bacon.Desc(Bacon, "combineAsArray", streams));
    }
    else {
        return constant([]);
    }
}
Bacon.combineAsArray = combineAsArray;
// TODO: untyped
Bacon.combineWith = function () {
    var _a = argumentsToObservablesAndFunction(arguments), streams = _a[0], f = _a[1];
    var desc = new Desc(Bacon, "combineWith", [f].concat(streams));
    return Bacon.combineAsArray(streams).map(function (values) {
        return f.apply(void 0, values);
    }).withDesc(desc);
};
function combine(left, right, f) {
    return whenP([[wrap(left), wrap(right)], f]).withDesc(new Desc(left, "combine", [right, f]));
}

function wrap(obs) {
    return new DefaultSource(obs, true);
}

function skip(src, count) {
    return src.transform(function (event, sink) {
        if (!event.hasValue) {
            return sink(event);
        }
        else if (count > 0) {
            count--;
            return more;
        }
        else {
            return sink(event);
        }
    }, new Desc(src, "skip", [count]));
}

function flatMapConcat(src, f) {
    return flatMap_(handleEventValueWith(f), src, {
        desc: new Desc(src, "flatMapConcat", [f]),
        limit: 1
    });
}

var makeCombinator = function (combinator) {
    if ((typeof combinator !== "undefined" && combinator !== null)) {
        return combinator;
    }
    else {
        return Bacon._.id;
    }
};
function sampledByP(samplee, sampler, f) {
    var combinator = makeCombinator(f);
    var result = withLatestFrom(sampler, samplee, flip(combinator));
    return result.withDesc(new Desc(samplee, "sampledBy", [sampler, combinator]));
}
function sampledByE(samplee, sampler, f) {
    return sampledByP(samplee.toProperty(), sampler, f).withDesc(new Desc(samplee, "sampledBy", [sampler, f]));
}
function sampleP(samplee, interval) {
    return sampledByP(samplee, Bacon.interval(interval, {}), function (a, b) { return a; }).withDesc(new Desc(samplee, "sample", [interval]));
}

function transformP(src, transformer, desc) {
    return new Property(new Desc(src, "transform", [transformer]), function (sink) {
        return src.subscribeInternal(function (e) {
            return transformer(e, sink);
        });
    }).withDesc(desc);
}
function transformE(src, transformer, desc) {
    return new EventStream(new Desc(src, "transform", [transformer]), function (sink) {
        return src.subscribeInternal(function (e) {
            return transformer(e, sink);
        });
    }, undefined, allowSync).withDesc(desc);
}
function composeT(t1, t2) {
    var finalSink; // mutation used to avoid closure creation while dispatching events
    var sink2 = function (event) {
        return t2(event, finalSink);
    };
    return function (event, sink) {
        finalSink = sink;
        return t1(event, sink2);
    };
}

function toPredicate(f) {
    if (typeof f == "boolean") {
        return _.always(f);
    }
    else if (typeof f != "function") {
        throw new Error("Not a function: " + f);
    }
    else {
        return f;
    }
}
function withPredicate(src, f, predicateTransformer, desc) {
    if (f instanceof Property) {
        return withLatestFrom(src, f, function (p, v) { return [p, v]; })
            .transform(composeT(predicateTransformer(function (_a) {
            var v = _a[0], p = _a[1];
            return p;
        }), mapT(function (_a) {
            var v = _a[0], p = _a[1];
            return v;
        })), desc);
    }
    return src.transform(predicateTransformer(toPredicate(f)), desc);
}

function filter(src, f) {
    return withPredicate(src, f, filterT, new Desc(src, "filter", [f]));
}
function filterT(f) {
    return function (e, sink) {
        if (e.filter(f)) {
            return sink(e);
        }
        else {
            return more;
        }
    };
}

function not(src) {
    return src.map(function (x) { return !x; }).withDesc(new Desc(src, "not", []));
}
function and(left, right) {
    return left.combine(toProperty(right), function (x, y) { return x && y; }).withDesc(new Desc(left, "and", [right]));
}
function or(left, right) {
    return left.combine(toProperty(right), function (x, y) { return x || y; }).withDesc(new Desc(left, "or", [right]));
}
function toProperty(x) {
    if (isProperty(x)) {
        return x;
    }
    return constant(x);
}

function flatMapFirst(src, f) {
    return flatMap_(handleEventValueWith(f), src, {
        firstOnly: true,
        desc: new Desc(src, "flatMapFirst", [f])
    });
}

function concatE(left, right, options) {
    return new EventStream(new Desc(left, "concat", [right]), function (sink) {
        var unsubRight = nop;
        var unsubLeft = left.dispatcher.subscribe(function (e) {
            if (e.isEnd) {
                unsubRight = right.toEventStream().dispatcher.subscribe(sink);
                return unsubRight;
            }
            else {
                return sink(e);
            }
        });
        return function () {
            return unsubLeft(), unsubRight();
        };
    }, undefined, options);
}
function concatAll() {
    var streams_ = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        streams_[_i] = arguments[_i];
    }
    var streams = argumentsToObservables(streams_);
    if (streams.length) {
        return _.fold(_.tail(streams), _.head(streams).toEventStream(), function (a, b) { return a.concat(b); })
            .withDesc(new Desc(Bacon, "concatAll", streams));
    }
    else {
        return never();
    }
}
Bacon.concatAll = concatAll;

function addPropertyInitValueToStream(property, stream) {
    var justInitValue = new EventStream(describe(property, "justInitValue"), function (sink) {
        var value;
        var unsub = property.dispatcher.subscribe(function (event) {
            if (!event.isEnd) {
                value = event;
            }
            return noMore;
        });
        UpdateBarrier.whenDoneWith(justInitValue, function () {
            if ((typeof value !== "undefined" && value !== null)) {
                sink(value);
            }
            return sink(endEvent());
        });
        return unsub;
    }, undefined, allowSync);
    return justInitValue.concat(stream, allowSync).toProperty();
}

function fold(src, seed, f) {
    return src.scan(seed, f)
        .last()
        .withDesc(new Desc(src, "fold", [seed, f]));
}

function startWithE(src, seed) {
    return once(seed).concat(src).withDesc(new Desc(src, "startWith", [seed]));
}
function startWithP(src, seed) {
    return src.scan(seed, function (prev, next) { return next; }).withDesc(new Desc(src, "startWith", [seed]));
}

var endMarker = {};
function takeUntil(src, stopper) {
    var endMapped = src.mapEnd(endMarker);
    var withEndMarker = groupSimultaneous_([endMapped, stopper.skipErrors()], allowSync);
    if (src instanceof Property)
        withEndMarker = withEndMarker.toProperty();
    return withEndMarker.transform(function (event, sink) {
        if (hasValue(event)) {
            var _a = event.value, data = _a[0], stopper = _a[1];
            if (stopper.length) {
                return sink(endEvent());
            }
            else {
                var reply = more;
                for (var i = 0; i < data.length; i++) {
                    var value = data[i];
                    if (value === endMarker) {
                        return sink(endEvent());
                    }
                    else {
                        reply = sink(nextEvent(value));
                    }
                }
                return reply;
            }
        }
        else {
            return sink(event);
        }
    }, new Desc(src, "takeUntil", [stopper]));
}

function flatMap(src, f) {
    return flatMap_(handleEventValueWith(f), src, { desc: new Desc(src, "flatMap", [f]) });
}

function flatMapError(src, f) {
    return flatMap_(function (x) {
        if (x instanceof Error$1) {
            var error = x.error;
            return f(error);
        }
        else {
            return x;
        }
    }, src, {
        mapError: true,
        desc: new Desc(src, "flatMapError", [f])
    });
}

function flatMapLatest(src, f_) {
    var f = _.toFunction(f_);
    var stream = isProperty(src) ? src.toEventStream(allowSync) : src;
    var flatMapped = flatMap(stream, function (value) { return makeObservable(f(value)).takeUntil(stream); });
    if (isProperty(src))
        flatMapped = flatMapped.toProperty();
    return flatMapped.withDesc(new Desc(src, "flatMapLatest", [f]));
}

var Dispatcher = /** @class */ (function () {
    function Dispatcher(observable, _subscribe, _handleEvent) {
        this.pushing = false;
        this.ended = false;
        this.prevError = undefined;
        this.unsubSrc = undefined;
        this._subscribe = _subscribe;
        this._handleEvent = _handleEvent;
        this.subscribe = _.bind(this.subscribe, this);
        this.handleEvent = _.bind(this.handleEvent, this);
        this.subscriptions = [];
        this.observable = observable;
        this.queue = [];
    }
    Dispatcher.prototype.hasSubscribers = function () {
        return this.subscriptions.length > 0;
    };
    Dispatcher.prototype.removeSub = function (subscription) {
        this.subscriptions = _.without(subscription, this.subscriptions);
        return this.subscriptions;
    };
    Dispatcher.prototype.push = function (event) {
        if (event.isEnd) {
            this.ended = true;
        }
        return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
    };
    Dispatcher.prototype.pushToSubscriptions = function (event) {
        try {
            var tmp = this.subscriptions;
            var len = tmp.length;
            for (var i = 0; i < len; i++) {
                var sub = tmp[i];
                var reply = sub.sink(event);
                if (reply === noMore || event.isEnd) {
                    this.removeSub(sub);
                }
            }
            return true;
        }
        catch (error) {
            this.pushing = false;
            this.queue = []; // ditch queue in case of exception to avoid unexpected behavior
            throw error;
        }
    };
    Dispatcher.prototype.pushIt = function (event) {
        if (!this.pushing) {
            if (event === this.prevError) {
                return;
            }
            if (event.isError) {
                this.prevError = event;
            }
            this.pushing = true;
            this.pushToSubscriptions(event);
            this.pushing = false;
            while (true) {
                var e = this.queue.shift();
                if (e) {
                    this.push(e);
                }
                else {
                    break;
                }
            }
            if (this.hasSubscribers()) {
                return more;
            }
            else {
                this.unsubscribeFromSource();
                return noMore;
            }
        }
        else {
            this.queue.push(event);
            return more;
        }
    };
    Dispatcher.prototype.handleEvent = function (event) {
        if (this._handleEvent) {
            return this._handleEvent(event);
        }
        else {
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
        var _this = this;
        if (this.ended) {
            sink(endEvent());
            return nop;
        }
        else {
            assertFunction(sink);
            var subscription_1 = {
                sink: sink
            };
            this.subscriptions.push(subscription_1);
            if (this.subscriptions.length === 1) {
                this.unsubSrc = this._subscribe(this.handleEvent);
                assertFunction(this.unsubSrc);
            }
            return function () {
                _this.removeSub(subscription_1);
                if (!_this.hasSubscribers()) {
                    return _this.unsubscribeFromSource();
                }
            };
        }
    };
    Dispatcher.prototype.inspect = function () {
        return this.observable.toString();
    };
    return Dispatcher;
}());

var PropertyDispatcher = /** @class */ (function (_super) {
    __extends(PropertyDispatcher, _super);
    function PropertyDispatcher(property, subscribe, handleEvent) {
        var _this = _super.call(this, property, subscribe, handleEvent) || this;
        _this.current = none();
        _this.propertyEnded = false;
        _this.subscribe = _.bind(_this.subscribe, _this);
        return _this;
    }
    PropertyDispatcher.prototype.push = function (event) {
        //console.log("dispatch", event, "from",  this)
        if (event.isEnd) {
            this.propertyEnded = true;
        }
        if (event instanceof Value) {
            //console.log("setting current")
            this.current = new Some(event);
            this.currentValueRootId = UpdateBarrier.currentEventId();
        }
        else if (event.hasValue) {
            console.error("Unknown event, two Bacons loaded?", event.constructor);
        }
        return _super.prototype.push.call(this, event);
    };
    PropertyDispatcher.prototype.maybeSubSource = function (sink, reply) {
        if (reply === Bacon.noMore) {
            return nop;
        }
        else if (this.propertyEnded) {
            sink(endEvent());
            return nop;
        }
        else {
            return _super.prototype.subscribe.call(this, sink);
        }
    };
    PropertyDispatcher.prototype.subscribe = function (sink) {
        var _this = this;
        // init value is "bounced" here because the base Dispatcher class
        // won't add more than one subscription to the underlying observable.
        // without bouncing, the init value would be missing from all new subscribers
        // after the first one
        var reply = Bacon.more;
        if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
            // should bounce init value
            var dispatchingId = UpdateBarrier.currentEventId();
            var valId = this.currentValueRootId;
            if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
                // when subscribing while already dispatching a value and this property hasn't been updated yet
                // we cannot bounce before this property is up to date.
                //console.log("bouncing with possibly stale value", event.value, "root at", valId, "vs", dispatchingId)
                UpdateBarrier.whenDoneWith(this.observable, function () {
                    if (_this.currentValueRootId === valId) {
                        //console.log("bouncing", this.current.get().value)
                        return sink(initialEvent(_this.current.get().value));
                    }
                });
                // the subscribing thing should be defered
                return this.maybeSubSource(sink, reply);
            }
            else {
                //console.log("bouncing immdiately", this.current.get().value)
                UpdateBarrier.inTransaction(undefined, this, function () {
                    reply = sink(initialEvent(_this.current.get().value));
                    return reply;
                }, []);
                return this.maybeSubSource(sink, reply);
            }
        }
        else {
            //console.log("normal subscribe", this)
            return this.maybeSubSource(sink, reply);
        }
    };
    PropertyDispatcher.prototype.inspect = function () {
        return this.observable + " current= " + this.current;
    };
    return PropertyDispatcher;
}(Dispatcher));

function flatMapWithConcurrencyLimit(src, limit, f) {
    return flatMap_(handleEventValueWith(f), src, {
        desc: new Desc(src, "flatMapWithConcurrencyLimit", [limit, f]),
        limit: limit
    });
}

function bufferWithTime(src, delay) {
    return bufferWithTimeOrCount(src, delay, Number.MAX_VALUE).withDesc(new Desc(src, "bufferWithTime", [delay]));
}

function bufferWithCount(src, count) {
    return bufferWithTimeOrCount(src, undefined, count).withDesc(new Desc(src, "bufferWithCount", [count]));
}

function bufferWithTimeOrCount(src, delay, count) {
    function flushOrSchedule(buffer) {
        if (buffer.values.length === count) {
            //console.log Bacon.scheduler.now() + ": count-flush"
            return buffer.flush();
        }
        else if (delay !== undefined) {
            return buffer.schedule();
        }
    }
    var desc = new Desc(src, "bufferWithTimeOrCount", [delay, count]);
    return buffer(src, delay, flushOrSchedule, flushOrSchedule).withDesc(desc);
}
var Buffer = /** @class */ (function () {
    function Buffer(onFlush, onInput, delay) {
        this.push = function (e) { };
        this.scheduled = null;
        this.end = undefined;
        this.values = [];
        this.onFlush = onFlush;
        this.onInput = onInput;
        this.delay = delay;
    }
    Buffer.prototype.flush = function () {
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
            }
            else if (reply !== noMore) {
                return this.onFlush(this);
            }
        }
        else {
            if ((this.end != null)) {
                return this.push(this.end);
            }
        }
    };
    Buffer.prototype.schedule = function () {
        var _this = this;
        if (!this.scheduled) {
            return this.scheduled = this.delay(function () {
                //console.log Bacon.scheduler.now() + ": scheduled flush"
                return _this.flush();
            });
        }
    };
    return Buffer;
}());
function buffer(src, delay, onInput, onFlush) {
    if (onInput === void 0) { onInput = nop; }
    if (onFlush === void 0) { onFlush = nop; }
    var reply = more;
    if (!_.isFunction(delay)) {
        var delayMs = delay;
        delay = function (f) {
            //console.log Bacon.scheduler.now() + ": schedule for " + (Bacon.scheduler.now() + delayMs)
            return Scheduler.scheduler.setTimeout(f, delayMs);
        };
    }
    var buffer = new Buffer(onFlush, onInput, delay);
    return src.transform(function (event, sink) {
        buffer.push = sink;
        if (hasValue(event)) {
            buffer.values.push(event.value);
            //console.log Bacon.scheduler.now() + ": input " + event.value
            onInput(buffer);
        }
        else if (event.isError) {
            reply = sink(event);
        }
        else if (event.isEnd) {
            buffer.end = event;
            if (!buffer.scheduled) {
                //console.log Bacon.scheduler.now() + ": end-flush"
                buffer.flush();
            }
        }
        return reply;
    }).withDesc(new Desc(src, "buffer", []));
}

function asyncWrapSubscribe(obs, subscribe) {
    //assertFunction(subscribe)
    var subscribing = false;
    return function wrappedSubscribe(sink) {
        //assertFunction(sink)
        var inTransaction = UpdateBarrier.isInTransaction();
        subscribing = true;
        var asyncDeliveries;
        function deliverAsync() {
            //console.log("delivering async", obs, asyncDeliveries)
            var toDeliverNow = asyncDeliveries || [];
            asyncDeliveries = undefined;
            for (var i = 0; i < toDeliverNow.length; i++) {
                var event = toDeliverNow[i];
                sink(event);
            }
        }
        try {
            return subscribe(function wrappedSink(event) {
                if (subscribing || asyncDeliveries) {
                    // Deliver async if currently subscribing
                    // Also queue further events until async delivery has been completed
                    //console.log("Stream responded synchronously", obs)
                    if (!asyncDeliveries) {
                        asyncDeliveries = [event];
                        if (inTransaction) {
                            UpdateBarrier.soonButNotYet(obs, deliverAsync);
                        }
                        else {
                            Scheduler.scheduler.setTimeout(deliverAsync, 0);
                        }
                    }
                    else {
                        asyncDeliveries.push(event);
                    }
                }
                else {
                    return sink(event);
                }
            });
        }
        finally {
            subscribing = false;
        }
    };
}

function mergeAll() {
    var streams = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        streams[_i] = arguments[_i];
    }
    streams = argumentsToObservables(streams);
    if (streams.length) {
        return new EventStream(new Desc(Bacon, "mergeAll", streams), function (sink) {
            var ends = 0;
            var smartSink = function (obs) {
                return function (unsubBoth) {
                    return obs.subscribeInternal(function (event) {
                        if (event.isEnd) {
                            ends++;
                            if (ends === streams.length) {
                                return sink(endEvent());
                            }
                            else {
                                return more;
                            }
                        }
                        else {
                            var reply = sink(event);
                            if (reply === noMore) {
                                unsubBoth();
                            }
                            return reply;
                        }
                    });
                };
            };
            var sinks = _.map(smartSink, streams);
            return new CompositeUnsubscribe(sinks).unsubscribe;
        });
    }
    else {
        return never();
    }
}
Bacon.mergeAll = mergeAll;

function fromBinder(binder, eventTransformer) {
    if (eventTransformer === void 0) { eventTransformer = _.id; }
    var desc = new Desc(Bacon, "fromBinder", [binder, eventTransformer]);
    return new EventStream(desc, function (sink) {
        var unbound = false;
        var shouldUnbind = false;
        var unbind = function () {
            if (!unbound) {
                if ((typeof unbinder !== "undefined" && unbinder !== null)) {
                    unbinder();
                    return unbound = true;
                }
                else {
                    return shouldUnbind = true;
                }
            }
        };
        var unbinder = binder(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var value_ = eventTransformer.apply(void 0, args);
            var valueArray = isArray(value_) && isEvent(_.last(value_))
                ? value_
                : [value_];
            var reply = Bacon.more;
            for (var i = 0; i < valueArray.length; i++) {
                var event = toEvent(valueArray[i]);
                reply = sink(event);
                if (reply === Bacon.noMore || event.isEnd) {
                    // defer if binder calls handler in sync before returning unbinder
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
}
Bacon.fromBinder = fromBinder;

function later(delay, value) {
    return fromBinder(function (sink) {
        var sender = function () {
            return sink([value, endEvent()]);
        };
        var id = Scheduler.scheduler.setTimeout(sender, delay);
        return function () {
            return Scheduler.scheduler.clearTimeout(id);
        };
    }).withDesc(new Desc(Bacon, "later", [delay, value]));
}
Bacon.later = later;

function delay(src, delay) {
    return src.delayChanges(new Desc(src, "delay", [delay]), function (changes) {
        return changes.flatMap(function (value) {
            return later(delay, value);
        });
    });
}

function debounce(src, delay) {
    return src.delayChanges(new Desc(src, "debounce", [delay]), function (changes) {
        return changes.flatMapLatest(function (value) {
            return later(delay, value);
        });
    });
}
function debounceImmediate(src, delay) {
    return src.delayChanges(new Desc(src, "debounceImmediate", [delay]), function (changes) {
        return changes.flatMapFirst(function (value) {
            return once(value).concat(later(delay, value).errors());
        });
    });
}

function throttle(src, delay) {
    return src.delayChanges(new Desc(src, "throttle", [delay]), function (changes) {
        return changes.bufferWithTime(delay).map(function (values) { return values[values.length - 1]; });
    });
}

function bufferingThrottle(src, minimumInterval) {
    var desc = new Desc(src, "bufferingThrottle", [minimumInterval]);
    return src.delayChanges(desc, function (changes) { return changes.flatMapConcat(function (x) {
        return once(x).concat(later(minimumInterval, x).errors());
    }); });
}

function takeWhile(src, f) {
    return withPredicate(src, f, takeWhileT, new Desc(src, "takeWhile", [f]));
}
function takeWhileT(f) {
    return function (event, sink) {
        if (event.filter(f)) {
            return sink(event);
        }
        else {
            sink(endEvent());
            return noMore;
        }
    };
}

function skipUntil(src, starter) {
    var started = starter
        .transform(composeT(takeT(1), mapT(true)))
        .toProperty()
        .startWith(false);
    return src.filter(started).withDesc(new Desc(src, "skipUntil", [starter]));
}

function skipWhile(src, f) {
    return withPredicate(src, f, skipWhileT, new Desc(src, "skipWhile", [f]));
}
function skipWhileT(f) {
    var started = false;
    return function (event, sink) {
        if (started || !hasValue(event) || !f(event.value)) {
            if (event.hasValue) {
                started = true;
            }
            return sink(event);
        }
        else {
            return more;
        }
    };
}

function groupBy(src, keyF, limitF) {
    if (limitF === void 0) { limitF = _.id; }
    var streams = {};
    return src.transform(composeT(filterT(function (x) { return !streams[keyF(x)]; }), mapT(function (firstValue) {
        var key = keyF(firstValue);
        var similarValues = src.filter(function (x) { return keyF(x) === key; });
        var data = once(firstValue).concat(similarValues);
        var limited = limitF(data, firstValue).transform(function (event, sink) {
            sink(event);
            if (event.isEnd) {
                delete streams[key];
            }
        });
        streams[key] = limited;
        return limited;
    })));
}

function slidingWindow(src, maxValues, minValues) {
    if (minValues === void 0) { minValues = 0; }
    return src.scan([], (function (window, value) {
        return window.concat([value]).slice(-maxValues);
    }))
        .filter((function (values) {
        return values.length >= minValues;
    })).withDesc(new Desc(src, "slidingWindow", [maxValues, minValues]));
}

function diff(src, start, f) {
    return transformP(scan(src, [start], function (prevTuple, next) { return [next, f(prevTuple[0], next)]; }), composeT(filterT(function (tuple) { return tuple.length === 2; }), mapT(function (tuple) { return tuple[1]; })), new Desc(src, "diff", [start, f]));
}

function flatScan(src, seed, f) {
    var current = seed;
    return src.flatMapConcat(function (next) {
        return makeObservable(f(current, next)).doAction(function (updated) { return current = updated; });
    }).toProperty().startWith(seed).withDesc(new Desc(src, "flatScan", [seed, f]));
}

function holdWhen(src, valve) {
    var onHold = false;
    var bufferedValues = [];
    var srcIsEnded = false;
    return new EventStream(new Desc(src, "holdWhen", [valve]), function (sink) {
        var composite = new CompositeUnsubscribe();
        var subscribed = false;
        var endIfBothEnded = function (unsub) {
            if (unsub) {
                unsub();
            }
            if (composite.empty() && subscribed) {
                return sink(endEvent());
            }
        };
        composite.add(function (unsubAll, unsubMe) {
            return valve.subscribeInternal(function (event) {
                if (hasValue(event)) {
                    onHold = event.value;
                    if (!onHold) {
                        var toSend = bufferedValues;
                        bufferedValues = [];
                        var result = more;
                        for (var i = 0; i < toSend.length; i++) {
                            result = sink(nextEvent(toSend[i]));
                        }
                        if (srcIsEnded) {
                            sink(endEvent());
                            unsubMe();
                            result = noMore;
                        }
                        return result;
                    }
                }
                else if (event.isEnd) {
                    return endIfBothEnded(unsubMe);
                }
                else {
                    return sink(event);
                }
            });
        });
        composite.add(function (unsubAll, unsubMe) {
            return src.subscribeInternal(function (event) {
                if (onHold && hasValue(event)) {
                    return bufferedValues.push(event.value);
                }
                else if (event.isEnd && bufferedValues.length) {
                    srcIsEnded = true;
                    return endIfBothEnded(unsubMe);
                }
                else {
                    return sink(event);
                }
            });
        });
        subscribed = true;
        endIfBothEnded();
        return composite.unsubscribe;
    });
}

function zipAsArray() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var streams = _.map((function (s) { return s.toEventStream(); }), argumentsToObservables(args));
    return Bacon.when(streams, function () {
        var xs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            xs[_i] = arguments[_i];
        }
        return xs;
    }).withDesc(new Desc(Bacon, "zipAsArray", args));
}
Bacon.zipAsArray = zipAsArray;
// TODO: quite untyped
function zipWith() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = argumentsToObservablesAndFunction(args), streams = _a[0], f = _a[1];
    streams = _.map((function (s) { return s.toEventStream(); }), streams);
    return Bacon.when(streams, f).withDesc(new Desc(Bacon, "zipWith", [f].concat(streams)));
}

Bacon.zipWith = zipWith;
function zip(left, right, f) {
    return Bacon.zipWith([left, right], f || Array).withDesc(new Desc(left, "zip", [right]));
}

var idCounter = 0;
var Observable = /** @class */ (function () {
    function Observable(desc) {
        this.id = ++idCounter;
        this._isObservable = true;
        this.desc = desc;
        this.initialDesc = desc;
    }
    Observable.prototype.awaiting = function (other) {
        return awaiting(this, other);
    };
    Observable.prototype.bufferingThrottle = function (minimumInterval) {
        return bufferingThrottle(this, minimumInterval);
    };
    Observable.prototype.combine = function (right, f) {
        return combine(this, right, f);
    };
    Observable.prototype.debounce = function (minimumInterval) {
        return debounce(this, minimumInterval);
    };
    Observable.prototype.debounceImmediate = function (minimumInterval) {
        return debounceImmediate(this, minimumInterval);
    };
    Observable.prototype.delay = function (delayMs) {
        return delay(this, delayMs);
    };
    Observable.prototype.deps = function () {
        return this.desc.deps();
    };
    Observable.prototype.diff = function (start, f) {
        return diff(this, start, f);
    };
    Observable.prototype.doAction = function (f) {
        return this.transform(doActionT(f), new Desc(this, "doAction", [f]));
    };
    Observable.prototype.doEnd = function (f) {
        return this.transform(doEndT(f), new Desc(this, "doEnd", [f]));
    };
    Observable.prototype.doError = function (f) {
        return this.transform(doErrorT(f), new Desc(this, "doError", [f]));
    };
    Observable.prototype.doLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.transform(doLogT(args), new Desc(this, "doLog", args));
    };
    Observable.prototype.endAsValue = function () {
        return endAsValue(this);
    };
    Observable.prototype.endOnError = function (predicate) {
        if (predicate === void 0) { predicate = function (x) { return true; }; }
        return endOnError(this, predicate);
    };
    Observable.prototype.errors = function () {
        return this.filter(function (x) { return false; }).withDesc(new Desc(this, "errors"));
    };
    Observable.prototype.filter = function (f) {
        return filter(this, f);
    };
    Observable.prototype.first = function () {
        return take(1, this, new Desc(this, "first"));
    };
    Observable.prototype.flatScan = function (seed, f) {
        return flatScan(this, seed, f);
    };
    Observable.prototype.fold = function (seed, f) {
        return fold(this, seed, f);
    };
    Observable.prototype.forEach = function (f) {
        if (f === void 0) { f = nop; }
        // TODO: inefficient alias. Also, similar assign alias missing.
        return this.onValue(f);
    };
    Observable.prototype.groupBy = function (keyF, limitF) {
        if (limitF === void 0) { limitF = _.id; }
        return groupBy(this, keyF, limitF);
    };
    Observable.prototype.holdWhen = function (valve) {
        return holdWhen(this, valve);
    };
    Observable.prototype.inspect = function () { return this.toString(); };
    Observable.prototype.internalDeps = function () {
        return this.initialDesc.deps();
    };
    Observable.prototype.last = function () {
        return last(this);
    };
    Observable.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        log(args, this);
        return this;
    };
    Observable.prototype.mapEnd = function (f) {
        return this.transform(mapEndT(f), new Desc(this, "mapEnd", [f]));
    };
    Observable.prototype.mapError = function (f) {
        return this.transform(mapErrorT(f), new Desc(this, "mapError", [f]));
    };
    Observable.prototype.name = function (name) {
        this._name = name;
        return this;
    };
    Observable.prototype.onEnd = function (f) {
        if (f === void 0) { f = nop; }
        return this.subscribe(function (event) {
            if (event.isEnd) {
                return f();
            }
        });
    };
    Observable.prototype.onError = function (f) {
        if (f === void 0) { f = nop; }
        return this.subscribe(function (event) {
            if (event.isError) {
                return f(event.error);
            }
        });
    };
    Observable.prototype.onValue = function (f) {
        if (f === void 0) { f = nop; }
        return this.subscribe(function (event) {
            if (event.hasValue) {
                return f(event.value);
            }
        });
    };
    Observable.prototype.onValues = function (f) {
        return this.onValue(function (args) { return f.apply(void 0, args); });
    };
    Observable.prototype.scan = function (seed, f) {
        return scan(this, seed, f);
    };
    Observable.prototype.skip = function (count) {
        return skip(this, count);
    };
    Observable.prototype.skipDuplicates = function (isEqual) {
        return skipDuplicates(this, isEqual);
    };
    Observable.prototype.skipErrors = function () {
        return skipErrors(this);
    };
    Observable.prototype.skipUntil = function (starter) {
        return skipUntil(this, starter);
    };
    Observable.prototype.skipWhile = function (f) {
        return skipWhile(this, f);
    };
    Observable.prototype.slidingWindow = function (maxValues, minValues) {
        if (minValues === void 0) { minValues = 0; }
        return slidingWindow(this, maxValues, minValues);
    };
    Observable.prototype.subscribe = function (sink) {
        var _this = this;
        if (sink === void 0) { sink = nop; }
        return UpdateBarrier.wrappedSubscribe(this, function (sink) { return _this.subscribeInternal(sink); }, sink);
    };
    Observable.prototype.take = function (count) {
        return take(count, this);
    };
    Observable.prototype.takeUntil = function (stopper) {
        return takeUntil(this, stopper);
    };
    Observable.prototype.takeWhile = function (f) {
        return takeWhile(this, f);
    };
    Observable.prototype.throttle = function (minimumInterval) {
        return throttle(this, minimumInterval);
    };
    Observable.prototype.toString = function () {
        if (this._name) {
            return this._name;
        }
        else {
            return this.desc.toString();
        }
    };
    Observable.prototype.withDesc = function (desc) {
        if (desc)
            this.desc = desc;
        return this;
    };
    Observable.prototype.withDescription = function (context, method) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.desc = describe.apply(void 0, [context, method].concat(args));
        return this;
    };
    Observable.prototype.zip = function (other, f) {
        return zip(this, other, f);
    };
    return Observable;
}());
var Property = /** @class */ (function (_super) {
    __extends(Property, _super);
    function Property(desc, subscribe, handler) {
        var _this = _super.call(this, desc) || this;
        _this._isProperty = true;
        assertFunction(subscribe);
        _this.dispatcher = new PropertyDispatcher(_this, subscribe, handler);
        registerObs(_this);
        return _this;
    }
    Property.prototype.and = function (other) {
        return and(this, other);
    };
    Property.prototype.changes = function () {
        var _this = this;
        return new EventStream(new Desc(this, "changes", []), function (sink) { return _this.dispatcher.subscribe(function (event) {
            if (!event.isInitial) {
                return sink(event);
            }
        }); });
    };
    Property.prototype.concat = function (right) {
        return addPropertyInitValueToStream(this, this.changes().concat(right));
    };
    Property.prototype.delayChanges = function (desc, f) {
        return addPropertyInitValueToStream(this, f(this.changes())).withDesc(desc);
    };
    Property.prototype.flatMap = function (f) {
        return flatMap(this, f);
    };
    Property.prototype.flatMapConcat = function (f) {
        return flatMapConcat(this, f);
    };
    Property.prototype.flatMapError = function (f) {
        return flatMapError(this, f);
    };
    Property.prototype.flatMapEvent = function (f) {
        return flatMapEvent(this, f);
    };
    Property.prototype.flatMapFirst = function (f) {
        return flatMapFirst(this, f);
    };
    Property.prototype.flatMapLatest = function (f) {
        return flatMapLatest(this, f);
    };
    Property.prototype.flatMapWithConcurrencyLimit = function (limit, f) {
        return flatMapWithConcurrencyLimit(this, limit, f);
    };
    Property.prototype.map = function (f) {
        return map(this, f);
    };
    Property.prototype.not = function () {
        return not(this);
    };
    Property.prototype.or = function (other) {
        return or(this, other);
    };
    Property.prototype.sample = function (interval) {
        return sampleP(this, interval);
    };
    Property.prototype.sampledBy = function (sampler, f) {
        if (f === void 0) { f = function (a, b) { return a; }; }
        return sampledByP(this, sampler, f);
    };
    Property.prototype.startWith = function (seed) {
        return startWithP(this, seed);
    };
    Property.prototype.subscribeInternal = function (sink) {
        if (sink === void 0) { sink = nop; }
        return this.dispatcher.subscribe(sink);
    };
    Property.prototype.toEventStream = function (options) {
        var _this = this;
        return new EventStream(new Desc(this, "toEventStream", []), function (sink) { return _this.subscribeInternal(function (event) {
            return sink(event.toNext());
        }); }, undefined, options);
    };
    Property.prototype.toProperty = function () {
        assertNoArguments(arguments);
        return this;
    };
    Property.prototype.transform = function (transformer, desc) {
        return transformP(this, transformer, desc);
    };
    Property.prototype.withStateMachine = function (initState, f) {
        return withStateMachine(initState, f, this);
    };
    return Property;
}(Observable));
function isProperty(x) {
    return !!x._isProperty;
}
// allowSync option is used for overriding the "force async" behaviour or EventStreams.
// ideally, this should not exist, but right now the implementation of some operations
// relies on using internal EventStreams that have synchronous behavior. These are not exposed
// to the outside world, though.
var allowSync = { forceAsync: false };
var EventStream = /** @class */ (function (_super) {
    __extends(EventStream, _super);
    function EventStream(desc, subscribe, handler, options) {
        var _this = _super.call(this, desc) || this;
        _this._isEventStream = true;
        if (options !== allowSync) {
            subscribe = asyncWrapSubscribe(_this, subscribe);
        }
        _this.dispatcher = new Dispatcher(_this, subscribe, handler);
        registerObs(_this);
        return _this;
    }
    EventStream.prototype.subscribeInternal = function (sink) {
        if (sink === void 0) { sink = nop; }
        return this.dispatcher.subscribe(sink);
    };
    EventStream.prototype.toEventStream = function () { return this; };
    EventStream.prototype.transform = function (transformer, desc) {
        return transformE(this, transformer, desc);
    };
    EventStream.prototype.withStateMachine = function (initState, f) {
        return withStateMachine(initState, f, this);
    };
    EventStream.prototype.map = function (f) { return map(this, f); };
    EventStream.prototype.flatMap = function (f) { return flatMap(this, f); };
    EventStream.prototype.flatMapConcat = function (f) { return flatMapConcat(this, f); };
    EventStream.prototype.flatMapFirst = function (f) { return flatMapFirst(this, f); };
    EventStream.prototype.flatMapLatest = function (f) { return flatMapLatest(this, f); };
    EventStream.prototype.flatMapWithConcurrencyLimit = function (limit, f) { return flatMapWithConcurrencyLimit(this, limit, f); };
    EventStream.prototype.flatMapError = function (f) { return flatMapError(this, f); };
    EventStream.prototype.flatMapEvent = function (f) { return flatMapEvent(this, f); };
    EventStream.prototype.sampledBy = function (sampler, f) {
        if (f === void 0) { f = function (a, b) { return a; }; }
        return sampledByE(this, sampler, f);
    };
    EventStream.prototype.startWith = function (seed) {
        return startWithE(this, seed);
    };
    EventStream.prototype.toProperty = function () {
        var initValue_ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            initValue_[_i] = arguments[_i];
        }
        var initValue = initValue_.length
            ? toOption(initValue_[0])
            : none();
        var disp = this.dispatcher;
        var desc = new Desc(this, "toProperty", Array.prototype.slice.apply(arguments));
        var streamSubscribe = disp.subscribe;
        return new Property(desc, streamSubscribeToPropertySubscribe(initValue, streamSubscribe));
    };
    EventStream.prototype.concat = function (right, options) {
        return concatE(this, right, options);
    };
    EventStream.prototype.merge = function (other) {
        assertEventStream(other);
        return mergeAll(this, other).withDesc(new Desc(this, "merge", [other]));
    };
    EventStream.prototype.not = function () { return not(this); };
    EventStream.prototype.delayChanges = function (desc, f) {
        return f(this).withDesc(desc);
    };
    EventStream.prototype.bufferWithTime = function (delay$$1) {
        return bufferWithTime(this, delay$$1);
    };
    EventStream.prototype.bufferWithCount = function (count) {
        return bufferWithCount(this, count);
    };
    EventStream.prototype.bufferWithTimeOrCount = function (delay$$1, count) {
        return bufferWithTimeOrCount(this, delay$$1, count);
    };
    return EventStream;
}(Observable));
function newEventStream(description, subscribe) {
    return new EventStream(description, subscribe);
}

var Bus = /** @class */ (function (_super) {
    __extends(Bus, _super);
    function Bus() {
        var _this = _super.call(this, new Desc(Bacon, "Bus", []), function (sink) { return _this.subscribeAll(sink); }) || this;
        _this.pushing = false;
        _this.pushQueue = undefined;
        _this.ended = false;
        _this.subscriptions = [];
        _this.unsubAll = _.bind(_this.unsubAll, _this);
        _this.subscribeAll = _.bind(_this.subscribeAll, _this);
        _this.guardedSink = _.bind(_this.guardedSink, _this);
        _this.subscriptions = []; // new array for each Bus instance
        _this.ended = false;
        EventStream.call(_this, new Desc(Bacon, "Bus", []), _this.subscribeAll);
        return _this;
    }
    Bus.prototype.unsubAll = function () {
        var iterable = this.subscriptions;
        for (var i = 0, sub; i < iterable.length; i++) {
            sub = iterable[i];
            if (typeof sub.unsub === "function") {
                sub.unsub();
            }
        }
    };
    Bus.prototype.subscribeAll = function (newSink) {
        if (this.ended) {
            newSink(endEvent());
        }
        else {
            this.sink = newSink;
            var iterable = this.subscriptions.slice();
            for (var i = 0, subscription; i < iterable.length; i++) {
                subscription = iterable[i];
                this.subscribeInput(subscription);
            }
        }
        return this.unsubAll;
    };
    Bus.prototype.guardedSink = function (input) {
        var _this = this;
        return function (event) {
            if (event.isEnd) {
                _this.unsubscribeInput(input);
                return Bacon.noMore;
            }
            else if (_this.sink) {
                return _this.sink(event);
            }
        };
    };
    Bus.prototype.subscribeInput = function (subscription) {
        subscription.unsub = subscription.input.dispatcher.subscribe(this.guardedSink(subscription.input));
        return subscription.unsub;
    };
    Bus.prototype.unsubscribeInput = function (input) {
        var iterable = this.subscriptions;
        for (var i = 0, sub; i < iterable.length; i++) {
            sub = iterable[i];
            if (sub.input === input) {
                if (typeof sub.unsub === "function") {
                    sub.unsub();
                }
                this.subscriptions.splice(i, 1);
                return;
            }
        }
    };
    Bus.prototype.plug = function (input) {
        var _this = this;
        assertObservable(input);
        if (this.ended) {
            return;
        }
        var sub = { input: input };
        this.subscriptions.push(sub);
        if (typeof this.sink !== "undefined") {
            this.subscribeInput(sub);
        }
        return (function () { return _this.unsubscribeInput(input); });
    };
    Bus.prototype.end = function () {
        this.ended = true;
        this.unsubAll();
        if (typeof this.sink === "function") {
            return this.sink(endEvent());
        }
    };
    Bus.prototype.push = function (value) {
        if (!this.ended && typeof this.sink === "function") {
            var rootPush = !this.pushing;
            if (!rootPush) {
                //console.log("recursive push")
                if (!this.pushQueue)
                    this.pushQueue = [];
                this.pushQueue.push(value);
                //console.log('queued', value)
                return;
            }
            this.pushing = true;
            try {
                return this.sink(nextEvent(value));
            }
            finally {
                if (rootPush && this.pushQueue) {
                    //console.log("start processing queue", this.pushQueue.length)
                    var i = 0;
                    while (i < this.pushQueue.length) {
                        //console.log("in loop", i, this.pushQueue[i])
                        var v = this.pushQueue[i];
                        this.sink(nextEvent(v));
                        i++;
                    }
                    this.pushQueue = undefined;
                }
                this.pushing = false;
            }
        }
    };
    Bus.prototype.error = function (error) {
        if (typeof this.sink === "function") {
            return this.sink(new Error$1(error));
        }
    };
    return Bus;
}(EventStream));
Bacon.Bus = Bus;

function withMethodCallSupport(wrapped) {
    return function (f) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (typeof f === "object" && args.length) {
            var context = f;
            var methodName = args[0];
            f = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return context[methodName].apply(context, args);
            };
            args = args.slice(1);
        }
        return wrapped.apply(void 0, [f].concat(args));
    };
}
function partiallyApplied(f, applied) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return f.apply(void 0, (applied.concat(args)));
    };
}
var makeFunction_ = withMethodCallSupport(function (f) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (_.isFunction(f)) {
        if (args.length) {
            return partiallyApplied(f, args);
        }
        else {
            return f;
        }
    }
    else {
        return _.always(f);
    }
});
function makeFunction(f, args) {
    return makeFunction_.apply(void 0, [f].concat(args));
}

function fromCallback(f) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return fromBinder(function (handler) {
        makeFunction(f, args)(handler);
        return nop;
    }, function (value) {
        return [value, endEvent()];
    }).withDesc(new Desc(Bacon, "fromCallback", [f].concat(args)));
}
function fromNodeCallback(f) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return fromBinder(function (handler) {
        makeFunction(f, args)(handler);
        return nop;
    }, function (error, value) {
        if (error) {
            return [new Error$1(error), endEvent()];
        }
        return [value, endEvent()];
    }).withDesc(new Desc(Bacon, "fromNodeCallback", [f].concat(args)));
}
Bacon.fromCallback = fromCallback;
Bacon.fromNodeCallback = fromNodeCallback;

function combineTemplate(template) {
  function current(ctxStack) {
    return ctxStack[ctxStack.length - 1];
  }
  function setValue(ctxStack, key, value) {
    current(ctxStack)[key] = value;
    return value;
  }
  function applyStreamValue(key, index) {
    return function (ctxStack, values) {
      setValue(ctxStack, key, values[index]);
    };
  }
  function constantValue(key, value) {
    return function (ctxStack) {
      setValue(ctxStack, key, value);
    };
  }

  function mkContext(template) {
    return isArray(template) ? [] : {};
  }

  function pushContext(key, value) {
    return function (ctxStack) {
      var newContext = mkContext(value);
      setValue(ctxStack, key, newContext);
      ctxStack.push(newContext);
    };
  }

  function containsObservables(value) {
    if (isObservable(value)) {
      return true;
    } else if (value && (value.constructor == Object || value.constructor == Array)) {
      for (var key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          var child = value[key];
          if (containsObservables(child)) return true;
        }
      }
    }
  }

  function compile(key, value) {
    if (isObservable(value)) {
      streams.push(value);
      funcs.push(applyStreamValue(key, streams.length - 1));
    } else if (containsObservables(value)) {
      var popContext = function (ctxStack) {
        ctxStack.pop();
      };
      funcs.push(pushContext(key, value));
      compileTemplate(value);
      funcs.push(popContext);
    } else {
      funcs.push(constantValue(key, value));
    }
  }

  function combinator(values) {
    var rootContext = mkContext(template);
    var ctxStack = [rootContext];
    for (var i = 0, f; i < funcs.length; i++) {
      f = funcs[i];
      f(ctxStack, values);
    }
    return rootContext;
  }

  function compileTemplate(template) {
    _.each(template, compile);
  }

  var funcs = [];
  var streams = [];

  var resultProperty = containsObservables(template) ? (compileTemplate(template), Bacon.combineAsArray(streams).map(combinator)) : Bacon.constant(template);

  return resultProperty.withDesc(new Desc(Bacon, "combineTemplate", [template]));
}

Bacon.combineTemplate = combineTemplate;

Observable.prototype.decode = function (cases) {
  return this.combine(combineTemplate(cases), function (key, values) {
    return values[key];
  }).withDesc(new Desc(this, "decode", [cases]));
};

function symbol(key) {
  if (typeof Symbol !== "undefined" && Symbol[key]) {
    return Symbol[key];
  } else if (typeof Symbol !== "undefined" && typeof Symbol["for"] === "function") {
    return Symbol[key] = Symbol["for"](key);
  } else {
    return "@@" + key;
  }
}

function ESObservable(observable) {
  this.observable = observable;
}

ESObservable.prototype.subscribe = function (observerOrOnNext, onError, onComplete) {
  var observer = typeof observerOrOnNext === 'function' ? { next: observerOrOnNext, error: onError, complete: onComplete } : observerOrOnNext;
  var subscription = {
    closed: false,
    unsubscribe: function () {
      subscription.closed = true;
      cancel();
    }
  };

  var cancel = this.observable.subscribe(function (event) {
    if (event.isError) {
      if (observer.error) observer.error(event.error);
      subscription.unsubscribe();
    } else if (event.isEnd) {
      subscription.closed = true;
      if (observer.complete) observer.complete();
    } else if (observer.next) {
      observer.next(event.value);
    }
  });
  return subscription;
};

ESObservable.prototype[symbol('observable')] = function () {
  return this;
};

Observable.prototype.toESObservable = function () {
  return new ESObservable(this);
};

Observable.prototype[symbol('observable')] = Observable.prototype.toESObservable;

function fromArray(values) {
    assertArray(values);
    if (!values.length) {
        return never().withDesc(new Desc(Bacon, "fromArray", values));
    }
    else {
        var i = 0;
        var stream = new EventStream(new Desc(Bacon, "fromArray", [values]), function (sink) {
            var unsubd = false;
            var reply = more;
            var pushing = false;
            var pushNeeded = false;
            function push() {
                pushNeeded = true;
                if (pushing) {
                    return;
                }
                pushing = true;
                while (pushNeeded) {
                    pushNeeded = false;
                    if ((reply !== noMore) && !unsubd) {
                        var value = values[i++];
                        reply = sink(toEvent(value));
                        if (reply !== noMore) {
                            if (i === values.length) {
                                sink(endEvent());
                            }
                            else {
                                UpdateBarrier.afterTransaction(stream, push);
                            }
                        }
                    }
                }
                pushing = false;
                return pushing;
            }
            UpdateBarrier.soonButNotYet(stream, push);
            return function () {
                unsubd = true;
                return unsubd;
            };
        });
        return stream;
    }
}

Bacon.fromArray = fromArray;

function fromESObservable(_observable) {
    var observable;
    if (_observable[symbol("observable")]) {
        observable = _observable[symbol("observable")]();
    }
    else {
        observable = _observable;
    }
    var desc = new Desc(Bacon, "fromESObservable", [observable]);
    return new EventStream(desc, function (sink) {
        var cancel = observable.subscribe({
            error: function (x) {
                sink(new Bacon.Error(x));
                sink(new Bacon.End());
            },
            next: function (value) { sink(new Bacon.Next(value)); },
            complete: function () {
                sink(new Bacon.End());
            }
        });
        // Support RxJS Observables
        if (cancel.unsubscribe) {
            return function () { cancel.unsubscribe(); };
        }
        else {
            return cancel;
        }
    });
}

Bacon.fromESObservable = fromESObservable;

// Wrap DOM EventTarget, Node EventEmitter, or
// [un]bind: (Any, (Any) -> None) -> None interfaces
// common in MVCs as EventStream
//
// target - EventTarget or EventEmitter, source of events
// eventSource - event name to bind or a function that performs custom binding
// eventTransformer - defaults to returning the first argument to handler
//
// Examples
//
//   Bacon.fromEventTarget(document.body, "click")
//   # => EventStream
//
//   Bacon.fromEventTarget(document.body, "scroll", {passive: true})
//   # => EventStream
//
//   Bacon.fromEventTarget (new EventEmitter(), "data")
//   # => EventStream
//
// Returns EventStream
var eventMethods = [
    ["addEventListener", "removeEventListener"],
    ["addListener", "removeListener"],
    ["on", "off"],
    ["bind", "unbind"]
];
var findHandlerMethods = function (target) {
    var pair;
    for (var i = 0; i < eventMethods.length; i++) {
        pair = eventMethods[i];
        var methodPair = [target[pair[0]], target[pair[1]]];
        if (methodPair[0] && methodPair[1]) {
            return methodPair;
        }
    }
    for (var j = 0; j < eventMethods.length; j++) {
        pair = eventMethods[j];
        var addListener = target[pair[0]];
        if (addListener) {
            return [addListener, function () { }];
        }
    }
    throw new Error("No suitable event methods in " + target);
};
function fromEventTarget(target, eventSource, eventTransformer) {
    var _a = findHandlerMethods(target), sub = _a[0], unsub = _a[1];
    var desc = new Desc(Bacon, "fromEvent", [target, eventSource]);
    return fromBinder(function (handler) {
        if (_.isFunction(eventSource)) {
            eventSource(sub.bind(target), handler);
            return function () {
                return eventSource(unsub.bind(target), handler);
            };
        }
        else {
            sub.call(target, eventSource, handler);
            return function () {
                return unsub.call(target, eventSource, handler);
            };
        }
    }, eventTransformer).withDesc(desc);
}
Bacon.fromEvent = Bacon.fromEventTarget = fromEventTarget;

function fromPoll(delay, poll) {
    var desc = new Desc(Bacon, "fromPoll", [delay, poll]);
    return fromBinder((function (handler) {
        var id = Scheduler.scheduler.setInterval(handler, delay);
        return function () {
            return Scheduler.scheduler.clearInterval(id);
        };
    }), poll).withDesc(desc);
}
Bacon.fromPoll = fromPoll;

function valueAndEnd(value) {
    return [value, endEvent()];
}
function fromPromise(promise, abort, eventTransformer) {
    if (eventTransformer === void 0) { eventTransformer = valueAndEnd; }
    return fromBinder(function (handler) {
        var bound = promise.then(handler, function (e) { return handler(new Error$1(e)); });
        if (bound && typeof bound.done === "function") {
            bound.done();
        }
        if (abort) {
            return function () {
                if (typeof promise.abort === "function") {
                    return promise.abort();
                }
            };
        }
        else {
            return function () {
            };
        }
    }, eventTransformer).withDesc(new Desc(Bacon, "fromPromise", [promise]));
}
Bacon.fromPromise = fromPromise;

function interval(delay, value) {
    return fromPoll(delay, function () {
        return nextEvent(value);
    }).withDesc(new Desc(Bacon, "interval", [delay, value]));
}
Bacon.interval = interval;

var B$ = {
    asEventStream: function (eventName, selector, eventTransformer) {
        var _this = this;
        if (_.isFunction(selector)) {
            eventTransformer = selector;
            selector = undefined;
        }
        return fromBinder(function (handler) {
            _this.on(eventName, selector, handler);
            return (function () { return _this.off(eventName, selector, handler); });
        }, eventTransformer).withDesc(new Desc(this.selector || this, "asEventStream", [eventName]));
    },
    init: function ($) {
        $.fn.asEventStream = B$.asEventStream;
    }
};
Bacon.$ = B$;

function onValues() {
  return Bacon.combineAsArray(Array.prototype.slice.call(arguments, 0, arguments.length - 1)).onValues(arguments[arguments.length - 1]);
}

Bacon.onValues = onValues;

function repeatedly(delay, values) {
    var index = 0;
    return fromPoll(delay, function () {
        return values[index++ % values.length];
    }).withDesc(new Desc(Bacon, "repeatedly", [delay, values]));
}
Bacon.repeatedly = repeatedly;

function repeat(generator) {
    var index = 0;
    return fromBinder(function (sink) {
        var flag = false;
        var reply = more;
        var unsub = function () { };
        function handleEvent(event) {
            if (event.isEnd) {
                if (!flag) {
                    return flag = true;
                }
                else {
                    return subscribeNext();
                }
            }
            else {
                return reply = sink(event);
            }
        }
        function subscribeNext() {
            var next;
            flag = true;
            while (flag && reply !== noMore) {
                next = generator(index++);
                flag = false;
                if (next) {
                    unsub = next.subscribeInternal(handleEvent);
                }
                else {
                    sink(endEvent());
                }
            }
            return flag = true;
        }
        subscribeNext();
        return function () { return unsub(); };
    });
}
Bacon.repeat = repeat;

function silence(duration) {
    return later(duration, "").filter(false);
}
Bacon.silence = silence;

function retry(options) {
    if (!_.isFunction(options.source)) {
        throw new Error("'source' option has to be a function");
    }
    var source = options.source;
    var retries = options.retries || 0;
    var retriesDone = 0;
    var delay = options.delay || function () {
        return 0;
    };
    var isRetryable = options.isRetryable || function () {
        return true;
    };
    var finished = false;
    var errorEvent = null;
    return Bacon.repeat(function (count) {
        function valueStream() {
            return source(count).endOnError().transform(function (event, sink) {
                if (isError(event)) {
                    errorEvent = event;
                    if (!(isRetryable(errorEvent.error) && (retries === 0 || retriesDone < retries))) {
                        finished = true;
                        return sink(event);
                    }
                }
                else {
                    if (hasValue(event)) {
                        errorEvent = null;
                        finished = true;
                    }
                    return sink(event);
                }
            });
        }
        if (finished) {
            return null;
        }
        else if (errorEvent) {
            var context = {
                error: errorEvent.error,
                retriesDone: retriesDone
            };
            var pause = silence(delay(context));
            retriesDone++;
            return pause.concat(Bacon.once().flatMap(valueStream));
        }
        else {
            return valueStream();
        }
    }).withDesc(new Desc(Bacon, "retry", [options]));
}

Bacon.retry = retry;

function sequentially(delay, values) {
    var index = 0;
    return fromPoll(delay, function () {
        var value = values[index++];
        if (index < values.length) {
            return value;
        }
        else if (index === values.length) {
            return [toEvent(value), endEvent()];
        }
        else {
            return endEvent();
        }
    }).withDesc(new Desc(Bacon, "sequentially", [delay, values]));
}
Bacon.sequentially = sequentially;

Observable.prototype.firstToPromise = function (PromiseCtr) {
  var _this = this;

  if (typeof PromiseCtr !== "function") {
    if (typeof Promise === "function") {
      PromiseCtr = Promise;
    } else {
      throw new Error("There isn't default Promise, use shim or parameter");
    }
  }

  return new PromiseCtr(function (resolve, reject) {
    return _this.subscribe(function (event) {
      if (event.hasValue) {
        resolve(event.value);
      }
      if (event.isError) {
        reject(event.error);
      }

      return noMore;
    });
  });
};

Observable.prototype.toPromise = function (PromiseCtr) {
  return this.last().firstToPromise(PromiseCtr);
};

function tryF(f) {
    return function (value) {
        try {
            return once(f(value));
        }
        catch (e) {
            return once(new Error$1(e));
        }
    };
}
Bacon["try"] = tryF;

function update(initial) {
    var patterns = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        patterns[_i - 1] = arguments[_i];
    }
    var rawPatterns = extractRawPatterns(patterns);
    for (var i = 0; i < rawPatterns.length; i++) {
        var pattern = rawPatterns[i];
        pattern[1] = lateBindFirst(pattern[1]);
    }
    return when.apply(void 0, rawPatterns).scan(initial, (function (x, f) {
        return f(x);
    })).withDesc(new Desc(Bacon, "update", [initial].concat(patterns)));
}
Bacon.update = update;
function lateBindFirst(f) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return function (i) {
            return f.apply(void 0, [i].concat(args));
        };
    };
}

Bacon.EventStream = EventStream;
Bacon.UpdateBarrier = UpdateBarrier;
Bacon.Observable = Observable;
Bacon.Property = Property;

return Bacon;

})));
