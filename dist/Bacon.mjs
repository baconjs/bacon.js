/** @hidden */
function nop() { }
/** @hidden */
const isArray = Array.isArray || function (xs) { return xs instanceof Array; };
/** @hidden */
function isObservable(x) {
    return x && x._isObservable;
}

/** @hidden */
function all(xs, f) {
    for (var i = 0, x; i < xs.length; i++) {
        x = xs[i];
        if (!f(x)) {
            return false;
        }
    }
    return true;
}
/** @hidden */
function always(x) { return () => x; }
/** @hidden */
function any(xs, f) {
    for (var i = 0, x; i < xs.length; i++) {
        x = xs[i];
        if (f(x)) {
            return true;
        }
    }
    return false;
}
/** @hidden */
function bind(fn, me) {
    return function () { return fn.apply(me, arguments); };
}
/** @hidden */
function contains(xs, x) { return indexOf(xs, x) !== -1; }
/** @hidden */
function each(xs, f) {
    for (var key in xs) {
        if (Object.prototype.hasOwnProperty.call(xs, key)) {
            var value = xs[key];
            f(key, value);
        }
    }
}
/** @hidden */
function empty(xs) { return xs.length === 0; }
/** @hidden */
function filter(f, xs) {
    var filtered = [];
    for (var i = 0, x; i < xs.length; i++) {
        x = xs[i];
        if (f(x)) {
            filtered.push(x);
        }
    }
    return filtered;
}
/** @hidden */
function flatMap(f, xs) {
    return fold(xs, [], (function (ys, x) {
        return ys.concat(f(x));
    }));
}
/** @hidden */
function flip(f) {
    return (a, b) => f(b, a);
}
/** @hidden */
function fold(xs, seed, f) {
    for (var i = 0, x; i < xs.length; i++) {
        x = xs[i];
        seed = f(seed, x);
    }
    return seed;
}
/** @hidden */
function head(xs) {
    return xs[0];
}
/** @hidden */
function id(x) { return x; }
/** @hidden */
function indexOfDefault(xs, x) { return xs.indexOf(x); }
/** @hidden */
function indexOfFallback(xs, x) {
    for (var i = 0, y; i < xs.length; i++) {
        y = xs[i];
        if (x === y) {
            return i;
        }
    }
    return -1;
}
/** @hidden */
const indexOf = Array.prototype.indexOf ? indexOfDefault : indexOfFallback;
/** @hidden */
function indexWhere(xs, f) {
    for (var i = 0, y; i < xs.length; i++) {
        y = xs[i];
        if (f(y)) {
            return i;
        }
    }
    return -1;
}
/** @hidden */
function isFunction(f) { return typeof f === "function"; }
/** @hidden */
function last(xs) { return xs[xs.length - 1]; }
/** @hidden */
function map(f, xs) {
    var result = [];
    for (var i = 0, x; i < xs.length; i++) {
        x = xs[i];
        result.push(f(x));
    }
    return result;
}
/** @hidden */
function negate(f) { return function (x) { return !f(x); }; }
/** @hidden */
function remove(x, xs) {
    var i = indexOf(xs, x);
    if (i >= 0) {
        return xs.splice(i, 1);
    }
}
/** @hidden */
function tail(xs) {
    return xs.slice(1, xs.length);
}
/** @hidden */
function toArray(xs) { return (isArray(xs) ? xs : [xs]); }
/** @hidden */
function toFunction(f) {
    if (typeof f == "function") {
        return f;
    }
    return x => f;
}
/** @hidden */
function toString(obj) {
    var hasProp = {}.hasOwnProperty;
    try {
        recursionDepth++;
        if (obj == null) {
            return "undefined";
        }
        else if (isFunction(obj)) {
            return "function";
        }
        else if (isArray(obj)) {
            if (recursionDepth > 5) {
                return "[..]";
            }
            return "[" + map(toString, obj).toString() + "]";
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
                let value = (function () {
                    try {
                        return obj[key];
                    }
                    catch (error) {
                        return error;
                    }
                })();
                results.push(toString(key) + ":" + toString(value));
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
/** @hidden */
function without(x, xs) {
    return filter((function (y) { return y !== x; }), xs);
}
var _ = {
    indexOf,
    indexWhere,
    head,
    always,
    negate,
    empty,
    tail,
    filter,
    map,
    each,
    toArray,
    contains,
    id,
    last,
    all,
    any,
    without,
    remove,
    fold,
    flatMap,
    bind,
    isFunction,
    toFunction,
    toString
};
var recursionDepth = 0;

/**
 * Reply for "more data, please".
 */
const more = undefined;
/**
 * Reply for "no more data, please".
 */
const noMore = "<no-more>";

/** @hidden */
function assert(message, condition) {
    if (!condition) {
        throw new Error(message);
    }
}
/** @hidden */
function assertEventStream(event) {
    if (!(event != null ? event._isEventStream : void 0)) {
        throw new Error("not an EventStream : " + event);
    }
}
/** @hidden */
function assertObservable(observable) {
    if (!(observable != null ? observable._isObservable : void 0)) {
        throw new Error("not an Observable : " + observable);
    }
}
/** @hidden */
function assertFunction(f) {
    return assert("not a function : " + f, _.isFunction(f));
}
/** @hidden */
function assertArray(xs) {
    if (!isArray(xs)) {
        throw new Error("not an array : " + xs);
    }
}
/** @hidden */
function assertNoArguments(args) {
    return assert("no arguments supported", args.length === 0);
}

/** @hidden */
const defaultScheduler = {
    setTimeout(f, d) { return setTimeout(f, d); },
    setInterval(f, i) { return setInterval(f, i); },
    clearInterval(id) { return clearInterval(id); },
    clearTimeout(id) { return clearTimeout(id); },
    now() { return new Date().getTime(); }
};
const GlobalScheduler = {
    scheduler: defaultScheduler
};
function getScheduler() {
    return GlobalScheduler.scheduler;
}
function setScheduler(newScheduler) {
    GlobalScheduler.scheduler = newScheduler;
}

var rootEvent = undefined;
var waiterObs = [];
var waiters = {};
var aftersStack = [];
var aftersStackHeight = 0;
var flushed = {};
var processingAfters = false;
function toString$1() {
    return _.toString({ rootEvent, processingAfters, waiterObs, waiters, aftersStack, aftersStackHeight, flushed });
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
        GlobalScheduler.scheduler.setTimeout(f, 0);
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
    let stackSizeAtStart = aftersStackHeight;
    if (!stackSizeAtStart)
        return;
    let isRoot = !processingAfters;
    processingAfters = true;
    try {
        while (aftersStackHeight >= stackSizeAtStart) { // to prevent sinking to levels started by others
            var topOfStack = aftersStack[aftersStackHeight - 1];
            if (!topOfStack)
                throw new Error("Unexpected stack top: " + topOfStack);
            var [topAfters, index] = topOfStack;
            if (index < topAfters.length) {
                var [, after] = topAfters[index];
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
    let unsubd = false;
    let shouldUnsub = false;
    let doUnsub = () => {
        shouldUnsub = true;
    };
    let unsub = () => {
        unsubd = true;
        doUnsub();
    };
    doUnsub = subscribe(function (event) {
        afterTransaction(obs, function () {
            if (!unsubd) {
                var reply = sink(event);
                if (reply === noMore) {
                    unsub();
                }
            }
        });
        return more;
    });
    if (shouldUnsub) {
        doUnsub();
    }
    return unsub;
}
function hasWaiters() { return waiterObs.length > 0; }
var UpdateBarrier = { toString: toString$1, whenDoneWith, hasWaiters, inTransaction, currentEventId, wrappedSubscribe, afterTransaction, soonButNotYet, isInTransaction };

class Desc {
    constructor(context, method, args = []) {
        /** @hidden */
        this._isDesc = true;
        //assert("context missing", context)
        //assert("method missing", method)
        //assert("args missing", args)
        this.context = context;
        this.method = method;
        this.args = args;
    }
    deps() {
        if (!this.cachedDeps) {
            this.cachedDeps = findDeps([this.context].concat(this.args));
        }
        return this.cachedDeps;
    }
    toString() {
        let args = _.map(_.toString, this.args);
        return _.toString(this.context) + "." + _.toString(this.method) + "(" + args + ")";
    }
}
/** @hidden */
function describe(context, method, ...args) {
    const ref = context || method;
    if (ref && ref._isDesc) {
        return context || method;
    }
    else {
        return new Desc(context, method, args);
    }
}
/** @hidden */
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

/** @hidden */
const nullSink = () => more;
/** @hidden */
const nullVoidSink = () => more;

/** @hidden */
function withStateMachine(initState, f, src) {
    return src.transform(withStateMachineT(initState, f), new Desc(src, "withStateMachine", [initState, f]));
}
function withStateMachineT(initState, f) {
    let state = initState;
    return (event, sink) => {
        var fromF = f(state, event);
        var [newState, outputs] = fromF;
        state = newState;
        var reply = more;
        for (var i = 0; i < outputs.length; i++) {
            let output = outputs[i];
            reply = sink(output);
            if (reply === noMore) {
                return reply;
            }
        }
        return reply;
    };
}

/** @hidden */
class Some {
    constructor(value) {
        this._isSome = true;
        this.isDefined = true;
        this.value = value;
    }
    getOrElse(arg) { return this.value; }
    get() { return this.value; }
    filter(f) {
        if (f(this.value)) {
            return new Some(this.value);
        }
        else {
            return None;
        }
    }
    map(f) {
        return new Some(f(this.value));
    }
    forEach(f) {
        f(this.value);
    }
    toArray() { return [this.value]; }
    inspect() { return "Some(" + this.value + ")"; }
    toString() { return this.inspect(); }
}
/** @hidden */
const None = {
    _isNone: true,
    getOrElse(value) { return value; },
    get() { throw new Error("None.get()"); },
    filter() { return None; },
    map() { return None; },
    forEach() { },
    isDefined: false,
    toArray() { return []; },
    inspect() { return "None"; },
    toString() { return this.inspect(); }
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
function isNone(object) {
    return ((typeof object !== "undefined" && object !== null) ? object._isNone : false);
}

/** @hidden */
var eventIdCounter = 0;
/**
 * Base class for all events passed through [EventStreams](eventstream.html) and [Properties](property.html).
 */
class Event {
    constructor() {
        this.id = ++eventIdCounter;
        /** @hidden */
        this.isEvent = true;
        /** @hidden */
        this._isEvent = true;
        this.isEnd = false;
        this.isInitial = false;
        this.isNext = false;
        this.isError = false;
        this.hasValue = false;
    }
    /** @hidden */
    filter(f) { return true; }
    /** @hidden */
    inspect() { return this.toString(); }
    /** @hidden */
    log() { return this.toString(); }
    /** @hidden */
    toNext() { return this; }
}
/**
 *  Base class for all [Events](event.html) carrying a value.
 *
 *  Can be distinguished from other events using [hasValue](../globals.html#hasvalue)
 **/
class Value extends Event {
    constructor(value) {
        super();
        this.hasValue = true;
        if (value instanceof Event) {
            throw new Error$1("Wrapping an event inside other event");
        }
        this.value = value;
    }
    /** @hidden */
    fmap(f) {
        return this.apply(f(this.value));
    }
    /** @hidden */
    filter(f) { return f(this.value); }
    /** @hidden */
    toString() { return _.toString(this.value); }
    //toString(): string { return "<value " + this.id + ">" + _.toString(this.value) }
    /** @hidden */
    log() { return this.value; }
}
/**
 *  Indicates a new value in an [EventStream](eventstream.html) or a [Property](property.html).
 *
 *  Can be distinguished from other events using [isNext](../globals.html#isnext)
 */
class Next extends Value {
    constructor(value) {
        super(value);
        this.isNext = true;
        /** @hidden */
        this._isNext = true; // some compatibility stuff?
    }
    /** @hidden */
    apply(value) { return new Next(value); }
}
/**
 * An event carrying the initial value of a [Property](classes/property.html). This event can be emitted by a property
 * immediately when subscribing to it.
 *
 * Can be distinguished from other events using [isInitial](../globals.html#isinitial)
 */
class Initial extends Value {
    constructor(value) {
        super(value);
        this.isInitial = true;
        /** @hidden */
        this._isInitial = true;
    }
    /** @hidden */
    apply(value) { return new Initial(value); }
    /** @hidden */
    toNext() { return new Next(this.value); }
}
/**
 * Base class for events not carrying a value.
 */
class NoValue extends Event {
    constructor() {
        super(...arguments);
        this.hasValue = false;
    }
    /** @hidden */
    fmap(f) {
        return this;
    }
}
/**
 * An event that indicates the end of an [EventStream](classes/eventstream.html) or a [Property](classes/property.html).
 * No more events can be emitted after this one.
 *
 * Can be distinguished from other events using [isEnd](../globals.html#isend)
 */
class End extends NoValue {
    constructor() {
        super(...arguments);
        this.isEnd = true;
    }
    /** @hidden */
    toString() { return "<end>"; }
}
/**
 *  An event carrying an error. You can use [onError](observable.html#onerror) to subscribe to errors.
 */
class Error$1 extends NoValue {
    constructor(error) {
        super();
        this.isError = true;
        this.error = error;
    }
    /** @hidden */
    toString() {
        return "<error> " + _.toString(this.error);
    }
}
/** @hidden */
function initialEvent(value) { return new Initial(value); }
/** @hidden */
function nextEvent(value) { return new Next(value); }
/** @hidden */
function endEvent() { return new End(); }
/** @hidden */
function toEvent(x) {
    if (x && x._isEvent) {
        return x;
    }
    else {
        return nextEvent(x);
    }
}
/**
 * Returns true if the given object is an [Event](classes/event.html).
 */
function isEvent(e) {
    return e && e._isEvent;
}
/**
 * Returns true if the given event is an [Initial](classes/initial.html) value of a [Property](classes/property.html).
 */
function isInitial(e) {
    return e && e._isInitial;
}
/**
 * Returns true if the given event is an [Error](classes/error.html) event of an [Observable](classes/observable.html).
 */
function isError(e) {
    return e.isError;
}
/**
 * Returns true if the given event is a [Value](classes/value.html), i.e. a [Next](classes/next.html) or
 * an [Initial](classes/error.html) value of an [Observable](classes/observable.html).
 */
function hasValue(e) {
    return e.hasValue;
}
/**
 * Returns true if the given event is an [End](classes/end.html)
 */
function isEnd(e) {
    return e.isEnd;
}
/**
 * Returns true if the given event is a [Next](classes/next.html)
 */
function isNext(e) {
    return e.isNext;
}

/** @hidden */
function equals(a, b) { return a === b; }
/** @hidden */
function skipDuplicates(src, isEqual = equals) {
    let desc = new Desc(src, "skipDuplicates", []);
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

/** @hidden */
function take(count, src, desc) {
    return src.transform(takeT(count), desc || new Desc(src, "take", [count]));
}
/** @hidden */
function takeT(count) {
    return (e, sink) => {
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

/** @hidden */
function log(args, src) {
    src.subscribe(function (event) {
        if (typeof console !== "undefined" && typeof console.log === "function") {
            console.log(...args.concat([event.log()]));
        }
        return more;
    });
}

/** @hidden */
function doLogT(args) {
    return (event, sink) => {
        if (typeof console !== "undefined" && console !== null && typeof console.log === "function") {
            console.log(...args.concat([event.log()]));
        }
        return sink(event);
    };
}

/** @hidden */
function doErrorT(f) {
    return (event, sink) => {
        if (isError(event)) {
            f(event.error);
        }
        return sink(event);
    };
}

/** @hidden */
function doActionT(f) {
    return (event, sink) => {
        if (hasValue(event)) {
            f(event.value);
        }
        return sink(event);
    };
}

/** @hidden */
function doEndT(f) {
    return (event, sink) => {
        if (isEnd(event)) {
            f();
        }
        return sink(event);
    };
}

/** @hidden */
function scan(src, seed, f) {
    let resultProperty;
    let acc = seed;
    let initHandled = false;
    const subscribe = (sink) => {
        var initSent = false;
        var unsub = nop;
        var reply = more;
        const sendInit = function () {
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
                return reply;
            }
        });
        UpdateBarrier.whenDoneWith(resultProperty, sendInit);
        return unsub;
    };
    return resultProperty = new Property(new Desc(src, "scan", [seed, f]), subscribe);
}

/** @hidden */
function mapEndT(f) {
    let theF = _.toFunction(f);
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

/** @hidden */
function mapErrorT(f) {
    let theF = _.toFunction(f);
    return function (event, sink) {
        if (isError(event)) {
            return sink(nextEvent(theF(event.error)));
        }
        else {
            return sink(event);
        }
    };
}

/** @hidden */
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

/** @hidden */
function last$1(src) {
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
            return more;
        }
        else {
            return sink(event);
        }
    }).withDesc(new Desc(src, "last", []));
}

/** @hidden */
class CompositeUnsubscribe {
    constructor(ss = []) {
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
    add(subscription) {
        if (!this.unsubscribed) {
            var ended = false;
            var unsub = nop;
            this.starting.push(subscription);
            var unsubMe = () => {
                if (this.unsubscribed) {
                    return;
                }
                ended = true;
                this.remove(unsub);
                _.remove(subscription, this.starting);
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
    }
    remove(unsub) {
        if (this.unsubscribed) {
            return;
        }
        if ((_.remove(unsub, this.subscriptions)) !== undefined) {
            return unsub();
        }
    }
    unsubscribe() {
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
    }
    count() {
        if (this.unsubscribed) {
            return 0;
        }
        return this.subscriptions.length + this.starting.length;
    }
    empty() {
        return this.count() === 0;
    }
}

/** @hidden */
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
                return reply;
            }
        });
        subbed = true;
        sendInit();
        return unsub;
    };
}

/** @hidden */
function propertyFromStreamSubscribe(desc, subscribe) {
    assertFunction(subscribe);
    return new Property(desc, streamSubscribeToPropertySubscribe(none(), subscribe));
}

/**
 Creates an EventStream that delivers the given
 single value for the first subscriber. The stream will end immediately
 after this value. You can also send an [`Bacon.Error`](#bacon-error) event instead of a
 value: `Bacon.once(new Bacon.Error("fail"))`.

 @param   value   the value or event to emit
 @typeparam V Type of stream elements
 */
function once(value) {
    const s = new EventStream(new Desc("Bacon", "once", [value]), function (sink) {
        UpdateBarrier.soonButNotYet(s, function () {
            sink(toEvent(value));
            sink(endEvent());
        });
        return nop;
    });
    return s;
}

/** @hidden */
function flatMap_(spawner, src, params = {}) {
    const root = src;
    const rootDep = [root];
    const childDeps = [];
    const isProperty = src._isProperty;
    const ctor = (isProperty ? propertyFromStreamSubscribe : newEventStreamAllowSync);
    let initialSpawned = false;
    const desc = params.desc || new Desc(src, "flatMap_", [spawner]);
    const result = ctor(desc, function (sink) {
        const composite = new CompositeUnsubscribe();
        const queue = [];
        function spawn(event) {
            if (isProperty && event.isInitial) {
                if (initialSpawned) {
                    return more;
                }
                initialSpawned = true;
            }
            const child = makeObservable(spawner(event));
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
                        const reply = sink(event);
                        if (reply === noMore) {
                            unsubAll();
                        }
                        return reply;
                    }
                });
            });
        }
        function checkQueue() {
            const event = queue.shift();
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
                        queue.push(event);
                    }
                    else {
                        spawn(event);
                    }
                    return more;
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
/** @hidden */
function handleEventValueWith(f) {
    if (typeof f == "function") {
        return ((event) => {
            if (hasValue(event)) {
                return f(event.value);
            }
            return event;
        });
    }
    return ((event) => f);
}
/** @hidden */
function makeObservable(x) {
    if (isObservable(x)) {
        return x;
    }
    else {
        return once(x);
    }
}

/** @hidden */
function flatMapEvent(src, f) {
    return flatMap_(f, src, {
        mapError: true,
        desc: new Desc(src, "flatMapEvent", [f])
    });
}

/** @hidden */
function endAsValue(src) {
    return src.transform((event, sink) => {
        if (isEnd(event)) {
            sink(nextEvent({}));
            sink(endEvent());
            return noMore;
        }
        return more;
    });
}

/** @hidden */
function endOnError(src, predicate = x => true) {
    return src.transform((event, sink) => {
        if (isError(event) && predicate(event.error)) {
            sink(event);
            return sink(endEvent());
        }
        else {
            return sink(event);
        }
    }, new Desc(src, "endOnError", []));
}

/** @hidden */
class Source {
    constructor(obs, sync) {
        this._isSource = true;
        this.flatten = true;
        this.ended = false;
        this.obs = obs;
        this.sync = sync;
    }
    subscribe(sink) {
        return this.obs.subscribeInternal(sink);
    }
    toString() {
        return this.obs.toString();
    }
    markEnded() {
        this.ended = true;
    }
    mayHave(count) { return true; }
}
/** @hidden */
class DefaultSource extends Source {
    consume() {
        return this.value;
    }
    push(x) {
        this.value = x;
    }
    hasAtLeast(c) {
        return !!this.value;
    }
}
/** @hidden */
class ConsumingSource extends Source {
    constructor(obs, sync) {
        super(obs, sync);
        this.flatten = false;
        this.queue = [];
    }
    consume() {
        return this.queue.shift();
    }
    push(x) {
        this.queue.push(x);
    }
    mayHave(count) {
        return !this.ended || this.queue.length >= count;
    }
    hasAtLeast(count) {
        return this.queue.length >= count;
    }
}
/** @hidden */
class BufferingSource extends Source {
    constructor(obs) {
        super(obs, true);
        this.queue = [];
    }
    consume() {
        const values = this.queue;
        this.queue = [];
        return {
            value: values
        };
    }
    push(x) {
        return this.queue.push(x.value);
    }
    hasAtLeast(count) {
        return true;
    }
}
/** @hidden */
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
/** @hidden */
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

/**
 Creates an EventStream that immediately ends.
 @typeparam V Type of stream elements
 */
function never() {
    return new EventStream(describe("Bacon", "never"), (sink) => {
        sink(endEvent());
        return nop;
    });
}

/**
 The `when` method provides a generalization of the [`zip`](classes/observable.html#zip) function. While zip
 synchronizes events from multiple streams pairwse, the join patterns used in `when` allow
 the implementation of more advanced synchronization patterns.

 Consider implementing a game with discrete time ticks. We want to
 handle key-events synchronized on tick-events, with at most one key
 event handled per tick. If there are no key events, we want to just
 process a tick.

 ```js
 Bacon.when(
 [tick, keyEvent, function(_, k) { handleKeyEvent(k); return handleTick(); }],
 [tick, handleTick])
 ```

 Order is important here. If the [tick] patterns had been written
 first, this would have been tried first, and preferred at each tick.

 Join patterns are indeed a generalization of zip, and for EventStreams, zip is
 equivalent to a single-rule join pattern. The following observables
 have the same output, assuming that all sources are EventStreams.

 ```js
 Bacon.zipWith(a,b,c, combine)
 Bacon.when([a,b,c], combine)
 ```

 Note that [`Bacon.when`](#bacon-when) does not trigger updates for events from Properties though;
 if you use a Property in your pattern, its value will be just sampled when all the
 other sources (EventStreams) have a value. This is useful when you need a value of a Property
 in your calculations. If you want your pattern to fire for a Property too, you can
 convert it into an EventStream using [`property.changes()`](#property-changes) or [`property.toEventStream()`](#property-toeventstream)

 * @param {Pattern<O>} patterns Join patterns
 * @typeparam O result type
 */
function when(...patterns) {
    return when_(newEventStream, patterns);
}
/** @hidden */
function whenP(...patterns) {
    return when_(propertyFromStreamSubscribe, patterns);
}
/** @hidden */
function when_(ctor, patterns) {
    if (patterns.length === 0) {
        return never();
    }
    var [sources, ixPats] = processRawPatterns(extractRawPatterns(patterns));
    if (!sources.length) {
        return never();
    }
    var needsBarrier = (any(sources, (s) => s.flatten)) && containsDuplicateDeps(map(((s) => s.obs), sources));
    var desc = new Desc("Bacon", "when", Array.prototype.slice.call(patterns));
    var resultStream = ctor(desc, function (sink) {
        var triggers = [];
        var ends = false;
        function match(p) {
            for (var i = 0; i < p.ixs.length; i++) {
                let ix = p.ixs[i];
                if (!sources[ix.index].hasAtLeast(ix.count)) {
                    return false;
                }
            }
            return true;
        }
        function cannotMatch(p) {
            for (var i = 0; i < p.ixs.length; i++) {
                let ix = p.ixs[i];
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
                        var reply = more;
                        for (var i = 0, p; i < ixPats.length; i++) {
                            p = ixPats[i];
                            if (match(p)) {
                                const values = [];
                                for (var j = 0; j < p.ixs.length; j++) {
                                    let event = sources[p.ixs[j].index].consume();
                                    if (!event)
                                        throw new Error("Event was undefined");
                                    values.push(event.value);
                                }
                                //console.log("flushing values", values)
                                let applied = p.f.apply(null, values);
                                //console.log('sinking', applied)
                                reply = sink((trigger).e.apply(applied));
                                if (triggers.length) {
                                    triggers = filter(nonFlattened, triggers);
                                }
                                if (reply === noMore) {
                                    return reply;
                                }
                                else {
                                    return flushWhileTriggers();
                                }
                            }
                        }
                    }
                    return more;
                }
                function flush() {
                    //console.log "flushing", _.toString(resultStream)
                    var reply = flushWhileTriggers();
                    if (ends) {
                        //console.log "ends detected"
                        if (all(sources, cannotSync) || all(ixPats, cannotMatch)) {
                            //console.log "actually ending"
                            reply = noMore;
                            sink(endEvent());
                        }
                    }
                    if (reply === noMore) {
                        unsubAll();
                    }
                }
                return source.subscribe(function (e) {
                    var reply = more;
                    if (e.isEnd) {
                        //console.log "got end"
                        ends = true;
                        source.markEnded();
                        flushLater();
                    }
                    else if (e.isError) {
                        reply = sink(e);
                    }
                    else {
                        let valueEvent = e;
                        //console.log "got value", e.value
                        source.push(valueEvent);
                        if (source.sync) {
                            //console.log "queuing", e.toString(), toString(resultStream)
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
                    return reply;
                });
            };
        }
        return new CompositeUnsubscribe(map(part, sources)).unsubscribe;
    });
    return resultStream;
}
function processRawPatterns(rawPatterns) {
    var sources = [];
    var pats = [];
    for (let i = 0; i < rawPatterns.length; i++) {
        let [patSources, f] = rawPatterns[i];
        var pat = { f, ixs: [] };
        var triggerFound = false;
        for (var j = 0, s; j < patSources.length; j++) {
            s = patSources[j];
            var index = indexOf(sources, s);
            if (!triggerFound) {
                triggerFound = isTrigger(s);
            }
            if (index < 0) {
                sources.push(s);
                index = sources.length - 1;
            }
            for (var k = 0; k < pat.ixs.length; k++) {
                let ix = pat.ixs[k];
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
    return [map(fromObservable /* sorry */, sources), pats];
}
function extractLegacyPatterns(sourceArgs) {
    var i = 0;
    var len = sourceArgs.length;
    var rawPatterns = [];
    while (i < len) {
        let patSources = toArray(sourceArgs[i++]);
        let f = toFunction(sourceArgs[i++]);
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
/** @hidden */
function extractRawPatterns(patterns) {
    let rawPatterns = [];
    for (let i = 0; i < patterns.length; i++) {
        let pattern = patterns[i];
        if (!isTypedOrRawPattern(pattern)) {
            // Fallback to legacy patterns
            return extractLegacyPatterns(patterns);
        }
        if (isRawPattern(pattern)) {
            rawPatterns.push([pattern[0], toFunction(pattern[1])]);
        }
        else { // typed pattern, then
            let sources = pattern.slice(0, pattern.length - 1);
            let f = toFunction(pattern[pattern.length - 1]);
            rawPatterns.push([sources, f]);
        }
    }
    return rawPatterns;
}
function containsDuplicateDeps(observables, state = []) {
    function checkObservable(obs) {
        if (contains(state, obs)) {
            return true;
        }
        else {
            var deps = obs.internalDeps();
            if (deps.length) {
                state.push(obs);
                return any(deps, checkObservable);
            }
            else {
                state.push(obs);
                return false;
            }
        }
    }
    return any(observables, checkObservable);
}
function cannotSync(source) {
    return !source.sync || source.ended;
}

/** @hidden */
function withLatestFromE(sampler, samplee, f) {
    var result = when([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true), flip(f)]);
    return result.withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]));
}
/** @hidden */
function withLatestFromP(sampler, samplee, f) {
    var result = whenP([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true), flip(f)]);
    return result.withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]));
}
/** @hidden */
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

/** @hidden */
function map$1(src, f) {
    if (f instanceof Property) {
        return withLatestFrom(src, f, (a, b) => b);
    }
    return src.transform(mapT(f), new Desc(src, "map", [f]));
}
/** @hidden */
function mapT(f) {
    let theF = _.toFunction(f);
    return (e, sink) => {
        return sink(e.fmap(theF));
    };
}

/**
 Creates a constant property with value `x`.
 */
function constant(x) {
    return new Property(new Desc("Bacon", "constant", [x]), function (sink) {
        sink(initialEvent(x));
        sink(endEvent());
        return nop;
    });
}

/** @hidden */
function argumentsToObservables(args) {
    args = (Array.prototype.slice.call(args));
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
/** @hidden */
function argumentsToObservablesAndFunction(args) {
    if (_.isFunction(args[0])) {
        return [argumentsToObservables(Array.prototype.slice.call(args, 1)), args[0]];
    }
    else {
        return [argumentsToObservables(Array.prototype.slice.call(args, 0, args.length - 1)), _.last(args)];
    }
}

/** @hidden */
function groupSimultaneous(...streams) {
    return groupSimultaneous_(argumentsToObservables(streams));
}
// TODO: type is not exactly correct, because different inputs may have different types.
// Result values are arrays where each element is the list from each input observable. Type this.
/** @hidden */
function groupSimultaneous_(streams, options) {
    let sources = _.map((stream) => new BufferingSource(stream), streams);
    let ctor = (desc, subscribe) => new EventStream(desc, subscribe, undefined, options);
    return when_(ctor, [sources, (function (...xs) {
            return xs;
        })]).withDesc(new Desc("Bacon", "groupSimultaneous", streams));
}

/** @hidden */
function awaiting(src, other) {
    return groupSimultaneous_([src, other], allowSync)
        .map((values) => values[1].length === 0)
        .toProperty(false)
        .skipDuplicates()
        .withDesc(new Desc(src, "awaiting", [other]));
}

/**
 Combines Properties, EventStreams and constant values so that the result Property will have an array of the latest
 values from all sources as its value. The inputs may contain both Properties and EventStreams.


 ```js
 property = Bacon.constant(1)
 stream = Bacon.once(2)
 constant = 3
 Bacon.combineAsArray(property, stream, constant)
 # produces the value [1,2,3]
 ```

 * @param streams streams and properties to combine
 */
function combineAsArray(...streams) {
    streams = argumentsToObservables(streams);
    if (streams.length) {
        var sources = [];
        for (var i = 0; i < streams.length; i++) {
            let stream = (isObservable(streams[i])
                ? streams[i]
                : constant(streams[i]));
            sources.push(wrap(stream));
        }
        return whenP([sources, (...xs) => xs]).withDesc(new Desc("Bacon", "combineAsArray", streams));
    }
    else {
        return constant([]);
    }
}
function combineWith(...args) {
    // TODO: untyped
    var [streams, f] = argumentsToObservablesAndFunction(arguments);
    var desc = new Desc("Bacon", "combineWith", [f, ...streams]);
    return combineAsArray(streams).map(function (values) {
        return f(...values);
    }).withDesc(desc);
}
const combine = combineWith;
/** @hidden */
function combineTwo(left, right, f) {
    return whenP([[wrap(left), wrap(right)], f]).withDesc(new Desc(left, "combine", [right, f]));
}
function wrap(obs) {
    return new DefaultSource(obs, true);
}

/** @hidden */
function skip(src, count) {
    return src.transform((event, sink) => {
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

/** @hidden */
function flatMapConcat(src, f) {
    return flatMap_(handleEventValueWith(f), src, {
        desc: new Desc(src, "flatMapConcat", [f]),
        limit: 1
    });
}

/**
 If none of the other factory methods above apply, you may of course roll your own EventStream by using `fromBinder`.

 <a name="bacon-frombinder"></a>
 [`Bacon.fromBinder(subscribe)`](#bacon-frombinder "Bacon.fromBinder(subscribe)") The parameter `subscribe` is a function that accepts a `sink` which is a function that your `subscribe` function can "push" events to.

 For example:

 ```js
 var stream = Bacon.fromBinder(function(sink) {
  sink("first value")
  sink([new Bacon.Next("2nd"), new Bacon.Next("3rd")])
  sink(new Bacon.Error("oops, an error"))
  sink(new Bacon.End())
  return function() {
     // unsub functionality here, this one's a no-op
  }
})
 stream.log()
 ```

 As shown in the example, you can push

 - A plain value, like `"first value"`
 - An [`Event`](#event) object including [`Bacon.Error`](#bacon-error) (wraps an error) and [`Bacon.End`](#bacon-end) (indicates
 stream end).
 - An array of [event](#event) objects at once

 Other examples can be found on [JSFiddle](http://jsfiddle.net/PG4c4/) and the
 [Bacon.js blog](http://baconjs.blogspot.fi/2013/12/wrapping-things-in-bacon.html).

 The `subscribe` function must return a function. Let's call that function
 `unsubscribe`. The returned function can be used by the subscriber (directly or indirectly) to
 unsubscribe from the EventStream. It should release all resources that the subscribe function reserved.

 The `sink` function may return [`Bacon.noMore`](#bacon-nomore) (as well as [`Bacon.more`](#bacon-more)
 or any other value). If it returns [`Bacon.noMore`](#bacon-nomore), no further events will be consumed
 by the subscriber. The `subscribe` function may choose to clean up all resources at this point (e.g.,
 by calling `unsubscribe`). This is usually not necessary, because further calls to `sink` are ignored,
 but doing so can increase performance in [rare cases](https://github.com/baconjs/bacon.js/issues/484).

 The EventStream will wrap your `subscribe` function so that it will
 only be called when the first stream listener is added, and the `unsubscribe`
 function is called only after the last listener has been removed.
 The subscribe-unsubscribe cycle may of course be repeated indefinitely,
 so prepare for multiple calls to the subscribe function.


 @param  binder
 @param  eventTransformer
 @typeparam V Type of stream elements

 */
function fromBinder(binder, eventTransformer = _.id) {
    var desc = new Desc("Bacon", "fromBinder", [binder, eventTransformer]);
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
        var unbinder = binder(function (...args) {
            var value_ = eventTransformer(...args);
            let valueArray = isArray(value_) && isEvent(_.last(value_))
                ? value_
                : [value_];
            var reply = more;
            for (var i = 0; i < valueArray.length; i++) {
                let event = toEvent(valueArray[i]);
                reply = sink(event);
                if (reply === noMore || event.isEnd) {
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

/**
 Polls given function with given interval.
 Function should return Events: either [`Bacon.Next`](classes/next.html) or [`Bacon.End`](classes/end.html). Polling occurs only
 when there are subscribers to the stream. Polling ends permanently when
 `f` returns [`Bacon.End`](classes/end.html).
 * @param delay poll interval in milliseconds
 * @param poll function to be polled
 * @typeparam V Type of stream elements
 */
function fromPoll(delay, poll) {
    var desc = new Desc("Bacon", "fromPoll", [delay, poll]);
    return fromBinder((function (handler) {
        var id = GlobalScheduler.scheduler.setInterval(handler, delay);
        return function () {
            return GlobalScheduler.scheduler.clearInterval(id);
        };
    }), poll).withDesc(desc);
}

/**
 Repeats the single element indefinitely with the given interval (in milliseconds)

 @param   delay   Repeat delay in milliseconds
 @param   value   The single value to repeat
 @typeparam V Type of stream elements
 */
function interval(delay, value) {
    return fromPoll(delay, function () {
        return nextEvent(value);
    }).withDesc(new Desc("Bacon", "interval", [delay, value]));
}

function makeCombinator(combinator) {
    if (typeof combinator == "function") {
        return combinator;
    }
    else {
        return _.id;
    }
}
/** @hidden */
function sampledBy(samplee, sampler, f) {
    if (samplee instanceof EventStream) {
        return sampledByE(samplee, sampler, f);
    }
    else {
        return sampledByP(samplee, sampler, f);
    }
}
/** @hidden */
function sampledByP(samplee, sampler, f) {
    let combinator = makeCombinator(f);
    var result = withLatestFrom(sampler, samplee, flip(combinator));
    return result.withDesc(new Desc(samplee, "sampledBy", [sampler]));
}
/** @hidden */
function sampledByE(samplee, sampler, f) {
    return sampledByP(samplee.toProperty(), sampler, f).withDesc(new Desc(samplee, "sampledBy", [sampler]));
}
/** @hidden */
function sampleP(samplee, samplingInterval) {
    return sampledByP(samplee, interval(samplingInterval, {}), (a, b) => a).withDesc(new Desc(samplee, "sample", [samplingInterval]));
}

/** @hidden */
function transformP(src, transformer, desc) {
    return new Property(new Desc(src, "transform", [transformer]), sink => src.subscribeInternal(e => transformer(e, sink))).withDesc(desc);
}
/** @hidden */
function transformE(src, transformer, desc) {
    return new EventStream(new Desc(src, "transform", [transformer]), sink => src.subscribeInternal(e => transformer(e, sink)), undefined, allowSync).withDesc(desc);
}
/** @hidden */
function composeT(t1, t2) {
    let finalSink; // mutation used to avoid closure creation while dispatching events
    const sink2 = (event) => {
        return t2(event, finalSink);
    };
    return (event, sink) => {
        finalSink = sink;
        return t1(event, sink2);
    };
}

/** @hidden */
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
/** @hidden */
function withPredicate(src, f, predicateTransformer, desc) {
    if (f instanceof Property) {
        return withLatestFrom(src, f, (p, v) => [p, v])
            .transform(composeT(predicateTransformer(((tuple) => tuple[1])), mapT((tuple) => tuple[0])), desc);
        // the `any` type above is needed because the type argument for Predicate2Transformer is fixed. We'd need higher-kinded types to be able to express this properly, I think.
    }
    return src.transform(predicateTransformer(toPredicate(f)), desc);
}

/** @hidden */
function filter$1(src, f) {
    return withPredicate(src, f, filterT, new Desc(src, "filter", [f]));
}
/** @hidden */
function filterT(f) {
    return (e, sink) => {
        if (e.filter(f)) {
            return sink(e);
        }
        else {
            return more;
        }
    };
}

/** @hidden */
function not(src) {
    return src.map(x => !x).withDesc(new Desc(src, "not", []));
}
/** @hidden */
function and(left, right) {
    return left.combine(toProperty(right), (x, y) => !!(x && y)).withDesc(new Desc(left, "and", [right]));
}
/** @hidden */
function or(left, right) {
    return left.combine(toProperty(right), (x, y) => x || y).withDesc(new Desc(left, "or", [right]));
}
function toProperty(x) {
    if (isProperty(x)) {
        return x;
    }
    return constant(x);
}

/** @hidden */
function flatMapFirst(src, f) {
    return flatMap_(handleEventValueWith(f), src, {
        firstOnly: true,
        desc: new Desc(src, "flatMapFirst", [f])
    });
}

/** @hidden */
function concatE(left, right, options) {
    return new EventStream(new Desc(left, "concat", [right]), function (sink) {
        var unsubRight = nop;
        var unsubLeft = left.dispatcher.subscribe(function (e) {
            if (e.isEnd) {
                unsubRight = right.toEventStream().dispatcher.subscribe(sink);
                return more;
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
/**
 Concatenates given array of EventStreams or Properties. Works by subscribing to the first source, and listeing to that
 until it ends. Then repeatedly subscribes to the next source, until all sources have ended.

 See [`concat`](#observable-concat)
 */
function concatAll(...streams_) {
    let streams = argumentsToObservables(streams_);
    return (streams.length
        ? fold(tail(streams), head(streams).toEventStream(), (a, b) => a.concat(b))
        : never()).withDesc(new Desc("Bacon", "concatAll", streams));
}

/** @hidden */
function transformPropertyChanges(property, f, desc) {
    let initValue;
    let comboSink;
    // Create a `changes` stream to be transformed, which also snatches the Initial value for later use.
    const changes = new EventStream(describe(property, "changes", []), (sink) => property.dispatcher.subscribe(function (event) {
        if (!initValue && isInitial(event)) {
            initValue = event;
            UpdateBarrier.whenDoneWith(combo, function () {
                if (!comboSink) {
                    throw new Error("Init sequence fail");
                }
                comboSink(initValue);
            });
        }
        if (!event.isInitial) {
            return sink(event);
        }
        return more;
    }), undefined, allowSync);
    const transformedChanges = f(changes);
    const combo = propertyFromStreamSubscribe(desc, (sink) => {
        comboSink = sink;
        return transformedChanges.dispatcher.subscribe(function (event) {
            sink(event);
        });
    });
    return combo;
}

/** @hidden */
function fold$1(src, seed, f) {
    return src.scan(seed, f)
        .last()
        .withDesc(new Desc(src, "fold", [seed, f]));
}

/** @hidden */
function startWithE(src, seed) {
    return once(seed).concat(src).withDesc(new Desc(src, "startWith", [seed]));
}
/** @hidden */
function startWithP(src, seed) {
    return src.scan(seed, (prev, next) => next).withDesc(new Desc(src, "startWith", [seed]));
}

/** @hidden */
const endMarker = {};
/** @hidden */
function takeUntil(src, stopper) {
    let endMapped = src.mapEnd(endMarker);
    let withEndMarker = groupSimultaneous_([endMapped, stopper.skipErrors()], allowSync);
    if (src instanceof Property)
        withEndMarker = withEndMarker.toProperty();
    return withEndMarker.transform(function (event, sink) {
        if (hasValue(event)) {
            var [data, stopper] = event.value;
            if (stopper.length) {
                return sink(endEvent());
            }
            else {
                var reply = more;
                for (var i = 0; i < data.length; i++) {
                    let value = data[i];
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

/** @hidden */
function flatMap$1(src, f) {
    return flatMap_(handleEventValueWith(f), src, { desc: new Desc(src, "flatMap", [f]) });
}

/** @hidden */
function flatMapError(src, f) {
    return flatMap_((x) => {
        if (x instanceof Error$1) {
            let error = x.error;
            return f(error); // I don't understand why I need this little lie
        }
        else {
            return x;
        }
    }, src, {
        mapError: true,
        desc: new Desc(src, "flatMapError", [f])
    });
}

var spies = [];
var running = false;
/** @hidden */
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
/**
 Adds your function as a "spy" that will get notified on all new Observables.
 This will allow a visualization/analytics tool to spy on all Bacon activity.
 */
const spy = (spy) => spies.push(spy);

/** @hidden */
function flatMapLatest(src, f_) {
    let f = _.toFunction(f_);
    var stream = isProperty(src) ? src.toEventStream(allowSync) : src;
    let flatMapped = flatMap$1(stream, (value) => makeObservable(f(value)).takeUntil(stream));
    if (isProperty(src))
        flatMapped = flatMapped.toProperty();
    return flatMapped.withDesc(new Desc(src, "flatMapLatest", [f]));
}

/** @hidden */
class Dispatcher {
    constructor(observable, _subscribe, _handleEvent) {
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
    hasSubscribers() {
        return this.subscriptions.length > 0;
    }
    removeSub(subscription) {
        this.subscriptions = _.without(subscription, this.subscriptions);
        return this.subscriptions;
    }
    push(event) {
        if (event.isEnd) {
            this.ended = true;
        }
        return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
    }
    pushToSubscriptions(event) {
        try {
            let tmp = this.subscriptions;
            const len = tmp.length;
            for (let i = 0; i < len; i++) {
                const sub = tmp[i];
                let reply = sub.sink(event);
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
    }
    pushIt(event) {
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
                let e = this.queue.shift();
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
    }
    handleEvent(event) {
        if (this._handleEvent) {
            return this._handleEvent(event);
        }
        else {
            return this.push(event);
        }
    }
    ;
    unsubscribeFromSource() {
        if (this.unsubSrc) {
            this.unsubSrc();
        }
        this.unsubSrc = undefined;
    }
    subscribe(sink) {
        if (this.ended) {
            sink(endEvent());
            return nop;
        }
        else {
            assertFunction(sink);
            let subscription = {
                sink: sink
            };
            this.subscriptions.push(subscription);
            if (this.subscriptions.length === 1) {
                this.unsubSrc = this._subscribe(this.handleEvent);
                assertFunction(this.unsubSrc);
            }
            return () => {
                this.removeSub(subscription);
                if (!this.hasSubscribers()) {
                    return this.unsubscribeFromSource();
                }
            };
        }
    }
    inspect() {
        return this.observable.toString();
    }
}

/** @hidden */
class PropertyDispatcher extends Dispatcher {
    constructor(property, subscribe, handleEvent) {
        super(property, subscribe, handleEvent);
        this.current = none();
        this.propertyEnded = false;
        this.subscribe = _.bind(this.subscribe, this);
    }
    push(event) {
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
        return super.push(event);
    }
    maybeSubSource(sink, reply) {
        if (reply === noMore) {
            return nop;
        }
        else if (this.propertyEnded) {
            sink(endEvent());
            return nop;
        }
        else {
            return super.subscribe(sink);
        }
    }
    subscribe(sink) {
        // init value is "bounced" here because the base Dispatcher class
        // won't add more than one subscription to the underlying observable.
        // without bouncing, the init value would be missing from all new subscribers
        // after the first one
        var reply = more;
        if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
            // should bounce init value
            var dispatchingId = UpdateBarrier.currentEventId();
            var valId = this.currentValueRootId;
            if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
                // when subscribing while already dispatching a value and this property hasn't been updated yet
                // we cannot bounce before this property is up to date.
                //console.log("bouncing with possibly stale value", event.value, "root at", valId, "vs", dispatchingId)
                UpdateBarrier.whenDoneWith(this.observable, () => {
                    if (this.currentValueRootId === valId) {
                        //console.log("bouncing", this.current.get().value)
                        return sink(initialEvent(this.current.get().value));
                    }
                });
                // the subscribing thing should be defered
                return this.maybeSubSource(sink, reply);
            }
            else {
                //console.log("bouncing immdiately", this.current.get().value)
                UpdateBarrier.inTransaction(undefined, this, () => {
                    reply = sink(initialEvent(this.current.get().value));
                    return reply;
                }, []);
                return this.maybeSubSource(sink, reply);
            }
        }
        else {
            //console.log("normal subscribe", this)
            return this.maybeSubSource(sink, reply);
        }
    }
    inspect() {
        return this.observable + " current= " + this.current;
    }
}

/** @hidden */
function flatMapWithConcurrencyLimit(src, limit, f) {
    return flatMap_(handleEventValueWith(f), src, {
        desc: new Desc(src, "flatMapWithConcurrencyLimit", [limit, f]),
        limit
    });
}

/** @hidden */
function bufferWithTime(src, delay) {
    return bufferWithTimeOrCount(src, delay, Number.MAX_VALUE).withDesc(new Desc(src, "bufferWithTime", [delay]));
}
/** @hidden */
function bufferWithCount(src, count) {
    return bufferWithTimeOrCount(src, undefined, count).withDesc(new Desc(src, "bufferWithCount", [count]));
}
/** @hidden */
function bufferWithTimeOrCount(src, delay, count) {
    const delayFunc = toDelayFunction(delay);
    function flushOrSchedule(buffer) {
        if (buffer.values.length === count) {
            //console.log Bacon.scheduler.now() + ": count-flush"
            return buffer.flush();
        }
        else if (delayFunc !== undefined) {
            return buffer.schedule(delayFunc);
        }
    }
    var desc = new Desc(src, "bufferWithTimeOrCount", [delay, count]);
    return buffer(src, flushOrSchedule, flushOrSchedule).withDesc(desc);
}
class Buffer {
    constructor(onFlush, onInput) {
        this.push = (e) => more;
        this.scheduled = null;
        this.end = undefined;
        this.values = [];
        this.onFlush = onFlush;
        this.onInput = onInput;
    }
    flush() {
        if (this.scheduled) {
            GlobalScheduler.scheduler.clearTimeout(this.scheduled);
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
    }
    schedule(delay) {
        if (!this.scheduled) {
            return this.scheduled = delay(() => {
                //console.log Bacon.scheduler.now() + ": scheduled flush"
                return this.flush();
            });
        }
    }
}
function toDelayFunction(delay) {
    if (delay === undefined) {
        return undefined;
    }
    if (typeof delay === "number") {
        var delayMs = delay;
        return function (f) {
            //console.log Bacon.scheduler.now() + ": schedule for " + (Bacon.scheduler.now() + delayMs)
            return GlobalScheduler.scheduler.setTimeout(f, delayMs);
        };
    }
    return delay;
}
/** @hidden */
function buffer(src, onInput = nop, onFlush = nop) {
    var reply = more;
    var buffer = new Buffer(onFlush, onInput);
    return src.transform((event, sink) => {
        buffer.push = sink;
        if (hasValue(event)) {
            buffer.values.push(event.value);
            //console.log Bacon.scheduler.now() + ": input " + event.value
            onInput(buffer);
        }
        else if (isError(event)) {
            reply = sink(event);
        }
        else if (isEnd(event)) {
            buffer.end = event;
            if (!buffer.scheduled) {
                //console.log Bacon.scheduler.now() + ": end-flush"
                buffer.flush();
            }
        }
        return reply;
    }).withDesc(new Desc(src, "buffer", []));
}

/** @hidden */
function asyncWrapSubscribe(obs, subscribe) {
    //assertFunction(subscribe)
    var subscribing = false;
    return function wrappedSubscribe(sink) {
        //assertFunction(sink)
        const inTransaction = UpdateBarrier.isInTransaction();
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
                            GlobalScheduler.scheduler.setTimeout(deliverAsync, 0);
                        }
                    }
                    else {
                        asyncDeliveries.push(event);
                    }
                    return more;
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

/**
 Merges given array of EventStreams or Properties, by collecting the values from all of the sources into a single
 EventStream.

 See also [`merge`](classes/eventstream.html#merge).
 */
function mergeAll(...streams) {
    let flattenedStreams = argumentsToObservables(streams);
    if (flattenedStreams.length) {
        return new EventStream(new Desc("Bacon", "mergeAll", flattenedStreams), function (sink) {
            var ends = 0;
            var smartSink = function (obs) {
                return function (unsubBoth) {
                    return obs.subscribeInternal(function (event) {
                        if (event.isEnd) {
                            ends++;
                            if (ends === flattenedStreams.length) {
                                return sink(endEvent());
                            }
                            else {
                                return more;
                            }
                        }
                        else {
                            event = event.toNext();
                            var reply = sink(event);
                            if (reply === noMore) {
                                unsubBoth();
                            }
                            return reply;
                        }
                    });
                };
            };
            var sinks = map(smartSink, flattenedStreams);
            return new CompositeUnsubscribe(sinks).unsubscribe;
        });
    }
    else {
        return never();
    }
}

/**

 Creates a single-element stream that emits given value after given delay and ends.

 @param delay delay in milliseconds
 @param value value to be emitted
 @typeparam V Type of stream elements

 */
function later(delay, value) {
    return fromBinder(function (sink) {
        var sender = function () {
            return sink([toEvent(value), endEvent()]);
        };
        var id = GlobalScheduler.scheduler.setTimeout(sender, delay);
        return function () {
            return GlobalScheduler.scheduler.clearTimeout(id);
        };
    }).withDesc(new Desc("Bacon", "later", [delay, value]));
}

/** @hidden */
function delay(src, delay) {
    return src.transformChanges(new Desc(src, "delay", [delay]), function (changes) {
        return changes.flatMap(function (value) {
            return later(delay, value);
        });
    });
}

/** @hidden */
function debounce(src, delay) {
    return src.transformChanges(new Desc(src, "debounce", [delay]), function (changes) {
        return changes.flatMapLatest(function (value) {
            return later(delay, value);
        });
    });
}
/** @hidden */
function debounceImmediate(src, delay) {
    return src.transformChanges(new Desc(src, "debounceImmediate", [delay]), function (changes) {
        return changes.flatMapFirst(function (value) {
            return once(value).concat(later(delay, value).errors());
        });
    });
}

/** @hidden */
function throttle(src, delay) {
    return src.transformChanges(new Desc(src, "throttle", [delay]), (changes) => changes.bufferWithTime(delay).map((values) => values[values.length - 1]));
}

/** @hidden */
function bufferingThrottle(src, minimumInterval) {
    var desc = new Desc(src, "bufferingThrottle", [minimumInterval]);
    return src.transformChanges(desc, changes => changes.flatMapConcat((x) => {
        return once(x).concat(later(minimumInterval, x).errors());
    }));
}

/** @hidden */
function takeWhile(src, f) {
    return withPredicate(src, f, takeWhileT, new Desc(src, "takeWhile", [f]));
}
function takeWhileT(f) {
    return (event, sink) => {
        if (event.filter(f)) {
            return sink(event);
        }
        else {
            sink(endEvent());
            return noMore;
        }
    };
}

/** @hidden */
function skipUntil(src, starter) {
    var started = starter
        .transform(composeT(takeT(1), mapT(true)))
        .toProperty()
        .startWith(false);
    return src.filter(started).withDesc(new Desc(src, "skipUntil", [starter]));
}

/** @hidden */
function skipWhile(src, f) {
    return withPredicate(src, f, skipWhileT, new Desc(src, "skipWhile", [f]));
}
/** @hidden */
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

/** @hidden */
function groupBy(src, keyF, limitF = _.id) {
    var streams = {};
    return src.transform(composeT(filterT((x) => !streams[keyF(x)]), mapT(function (firstValue) {
        var key = keyF(firstValue);
        var similarValues = src.changes().filter(x => keyF(x) === key);
        var data = once(firstValue).concat(similarValues);
        var limited = limitF(data, firstValue).toEventStream().transform((event, sink) => {
            let reply = sink(event);
            if (event.isEnd) {
                delete streams[key];
            }
            return reply;
        });
        streams[key] = limited;
        return limited;
    })));
}

/** @hidden */
function slidingWindow(src, maxValues, minValues = 0) {
    return src.scan([], (function (window, value) {
        return window.concat([value]).slice(-maxValues);
    }))
        .filter((function (values) {
        return values.length >= minValues;
    })).withDesc(new Desc(src, "slidingWindow", [maxValues, minValues]));
}

const nullMarker = {};
/** @hidden */
function diff(src, start, f) {
    return transformP(scan(src, [start, nullMarker], ((prevTuple, next) => [next, f(prevTuple[0], next)])), composeT(filterT(tuple => tuple[1] !== nullMarker), mapT(tuple => tuple[1])), new Desc(src, "diff", [start, f]));
}

/** @hidden */
function flatScan(src, seed, f) {
    let current = seed;
    return src.flatMapConcat((next) => makeObservable(f(current, next)).doAction(updated => current = updated)).toProperty().startWith(seed).withDesc(new Desc(src, "flatScan", [seed, f]));
}

/** @hidden */
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
            return more;
        };
        composite.add(function (unsubAll, unsubMe) {
            return valve.subscribeInternal(function (event) {
                if (hasValue(event)) {
                    onHold = event.value;
                    var result = more;
                    if (!onHold) {
                        var toSend = bufferedValues;
                        bufferedValues = [];
                        for (var i = 0; i < toSend.length; i++) {
                            result = sink(nextEvent(toSend[i]));
                        }
                        if (srcIsEnded) {
                            sink(endEvent());
                            unsubMe();
                            result = noMore;
                        }
                    }
                    return result;
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
                    bufferedValues.push(event.value);
                    return more;
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

/**
 Zips the array of EventStreams / Properties in to a new
 EventStream that will have an array of values from each source as
 its value. Zipping means that events from each source are combined
 pairwise so that the 1st event from each source is published first, then
 the 2nd event from each. The results will be published as soon as there
 is a value from each source.

 Be careful not to have too much "drift" between streams. If one stream
 produces many more values than some other excessive buffering will
 occur inside the zipped observable.

 Example:

 ```js
 x = Bacon.fromArray([1,2,3])
 y = Bacon.fromArray([10, 20, 30])
 z = Bacon.fromArray([100, 200, 300])
 Bacon.zipAsArray(x, y, z)

 # produces values [1, 10, 100], [2, 20, 200] and [3, 30, 300]
 ```

 */
function zipAsArray(...args) {
    let streams = _.map(((s) => s.toEventStream()), argumentsToObservables(args));
    return when([streams, (...xs) => xs]).withDesc(new Desc("Bacon", "zipAsArray", args));
}
/**
 Like [`zipAsArray`](#bacon-zipasarray) but uses the given n-ary
 function to combine the n values from n sources, instead of returning them in an Array.
 */
function zipWith(f, ...streams) {
    var [streams, f] = argumentsToObservablesAndFunction(arguments);
    streams = _.map(((s) => s.toEventStream()), streams);
    return when([streams, f]).withDesc(new Desc("Bacon", "zipWith", [f].concat(streams)));
}
/** @hidden */
function zip(left, right, f) {
    return zipWith(f || Array, left, right).withDesc(new Desc(left, "zip", [right]));
}

function combineTemplate(template) {
    function current(ctxStack) { return ctxStack[ctxStack.length - 1]; }
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
            const newContext = mkContext(value);
            setValue(ctxStack, key, newContext);
            ctxStack.push(newContext);
        };
    }
    function containsObservables(value) {
        if (isObservable(value)) {
            return true;
        }
        else if (value && (value.constructor == Object || value.constructor == Array)) {
            for (var key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    const child = value[key];
                    if (containsObservables(child))
                        return true;
                }
            }
        }
    }
    function compile(key, value) {
        if (isObservable(value)) {
            streams.push(value);
            funcs.push(applyStreamValue(key, streams.length - 1));
        }
        else if (containsObservables(value)) {
            const popContext = function (ctxStack) { ctxStack.pop(); };
            funcs.push(pushContext(key, value));
            compileTemplate(value);
            funcs.push(popContext);
        }
        else {
            funcs.push(constantValue(key, value));
        }
    }
    function combinator(values) {
        const rootContext = mkContext(template);
        const ctxStack = [rootContext];
        for (var i = 0, f; i < funcs.length; i++) {
            f = funcs[i];
            f(ctxStack, values);
        }
        return rootContext;
    }
    function compileTemplate(template) { _.each(template, compile); }
    const funcs = [];
    const streams = [];
    const resultProperty = containsObservables(template)
        ? (compileTemplate(template), combineAsArray(streams).map(combinator))
        : constant(template);
    return resultProperty.withDesc(new Desc("Bacon", "combineTemplate", [template]));
}

/** @hidden */
function decode(src, cases) {
    return src.combine(combineTemplate(cases), (key, values) => values[key])
        .withDesc(new Desc(src, "decode", [cases]));
}

/** @hidden */
function firstToPromise(src, PromiseCtr) {
    const generator = (resolve, reject) => src.subscribe((event) => {
        if (hasValue(event)) {
            resolve(event.value);
        }
        if (isError(event)) {
            reject(event.error);
        }
        // One event is enough
        return noMore;
    });
    // Can't do in the global scope, as shim can be applied after Bacon is loaded.
    if (typeof PromiseCtr === "function") {
        return new PromiseCtr(generator);
    }
    else if (typeof Promise === "function") {
        return new Promise(generator);
    }
    else {
        throw new Error("There isn't default Promise, use shim or parameter");
    }
}
/** @hidden */
function toPromise(src, PromiseCtr) {
    return src.last().firstToPromise(PromiseCtr);
}

var idCounter = 0;
/**
 Observable is the base class for [EventsStream](eventstream.html) and [Property](property.html)

 @typeparam V   Type of the elements/values in the stream/property
 */
class Observable {
    constructor(desc) {
        /**
         * Unique numeric id of this Observable. Implemented using a simple counter starting from 1.
         */
        this.id = ++idCounter;
        /** @hidden */
        this._isObservable = true;
        this.desc = desc;
        this.initialDesc = desc;
    }
    /**
  Creates a Property that indicates whether
  `observable` is awaiting `otherObservable`, i.e. has produced a value after the latest
  value from `otherObservable`. This is handy for keeping track whether we are
  currently awaiting an AJAX response:
  
  ```js
  var showAjaxIndicator = ajaxRequest.awaiting(ajaxResponse)
  ```
  
     */
    awaiting(other) {
        return awaiting(this, other);
    }
    /**
  Throttles the observable using a buffer so that at most one value event in minimumInterval is issued.
  Unlike [`throttle`](#observable-throttle), it doesn't discard the excessive events but buffers them instead, outputting
  them with a rate of at most one value per minimumInterval.
  
  Example:
  
  ```js
  var throttled = source.bufferingThrottle(2)
  ```
  
  ```
  source:    asdf----asdf----
  throttled: a-s-d-f-a-s-d-f-
  ```
     */
    bufferingThrottle(minimumInterval) {
        return bufferingThrottle(this, minimumInterval);
    }
    /**
  Combines the latest values of the two
  streams or properties using a two-arg function. Similarly to [`scan`](#scan), you can use a
  method name instead, so you could do `a.combine(b, ".concat")` for two
  properties with array value. The result is a [Property](property.html).
     */
    combine(right, f) {
        return combineTwo(this, right, f).withDesc(new Desc(this, "combine", [right, f]));
    }
    /**
  Throttles stream/property by given amount
  of milliseconds, but so that event is only emitted after the given
  "quiet period". Does not affect emitting the initial value of a [Property](property.html).
  The difference of [`throttle`](#throttle) and [`debounce`](#debounce) is the same as it is in the
  same methods in jQuery.
  
  Example:
  
  ```
  source:             asdf----asdf----
  source.debounce(2): -----f-------f--
  ```
  
     */
    debounce(minimumInterval) {
        return debounce(this, minimumInterval);
    }
    /**
  Passes the first event in the
  stream through, but after that, only passes events after a given number
  of milliseconds have passed since previous output.
  
  Example:
  
  ```
  source:                      asdf----asdf----
  source.debounceImmediate(2): a-d-----a-d-----
  ```
     */
    debounceImmediate(minimumInterval) {
        return debounceImmediate(this, minimumInterval);
    }
    /**
  Decodes input using the given mapping. Is a
  bit like a switch-case or the decode function in Oracle SQL. For
  example, the following would map the value 1 into the string "mike"
  and the value 2 into the value of the `who` property.
  
  ```js
  property.decode({1 : "mike", 2 : who})
  ```
  
  This is actually based on [`combineTemplate`](#combinetemplate) so you can compose static
  and dynamic data quite freely, as in
  
  ```js
  property.decode({1 : { type: "mike" }, 2 : { type: "other", whoThen : who }})
  ```
  
  The return value of [`decode`](#decode) is always a [`Property`](property.html).
  
     */
    //decode<T extends Record<any, any>>(src: Observable<keyof T>, cases: T): Property<DecodedValueOf<T>>
    decode(cases) {
        return decode(this, cases);
    }
    /**
  Delays the stream/property by given amount of milliseconds. Does not delay the initial value of a [`Property`](property.html).
  
  ```js
  var delayed = source.delay(2)
  ```
  
  ```
  source:    asdf----asdf----
  delayed:   --asdf----asdf--
  ```
  
     */
    delay(delayMs) {
        return delay(this, delayMs);
    }
    /**
     * Returns the an array of dependencies that the Observable has. For instance, for `a.map(function() {}).deps()`, would return `[a]`.
     This method returns the "visible" dependencies only, skipping internal details.  This method is thus suitable for visualization tools.
     Internally, many combinator functions depend on other combinators to create intermediate Observables that the result will actually depend on.
     The `deps` method will skip these internal dependencies. See also: [internalDeps](#internaldeps)
     */
    deps() {
        return this.desc.deps();
    }
    /**
  Returns a Property that represents the result of a comparison
  between the previous and current value of the Observable. For the initial value of the Observable,
  the previous value will be the given start.
  
  Example:
  
  ```js
  var distance = function (a,b) { return Math.abs(b - a) }
  Bacon.sequentially(1, [1,2,3]).diff(0, distance)
  ```
  
  This would result to following elements in the result stream:
  
      1 - 0 = 1
      2 - 1 = 1
      3 - 2 = 1
  
     */
    diff(start, f) {
        return diff(this, start, f);
    }
    /**
  Returns a stream/property where the function f
  is executed for each value, before dispatching to subscribers. This is
  useful for debugging, but also for stuff like calling the
  `preventDefault()` method for events. In fact, you can
  also use a property-extractor string instead of a function, as in
  `".preventDefault"`.
  
  Please note that for Properties, it's not guaranteed that the function will be called exactly once
  per event; when a Property loses all of its subscribers it will re-emit its current value when a
  new subscriber is added.
     */
    doAction(f) {
        return this.transform(doActionT(f), new Desc(this, "doAction", [f]));
    }
    doEnd(f) {
        return this.transform(doEndT(f), new Desc(this, "doEnd", [f]));
    }
    /**
  Returns a stream/property where the function f
  is executed for each error, before dispatching to subscribers.
  That is, same as [`doAction`](#observable-doaction) but for errors.
     */
    doError(f) {
        return this.transform(doErrorT(f), new Desc(this, "doError", [f]));
    }
    /**
  Logs each value of the Observable to the console. doLog() behaves like [`log`](#log)
  but does not subscribe to the event stream. You can think of doLog() as a
  logger function that – unlike log() – is safe to use in production. doLog() is
  safe, because it does not cause the same surprising side-effects as log()
  does.
     */
    doLog(...args) {
        return this.transform(doLogT(args), new Desc(this, "doLog", args));
    }
    endAsValue() {
        return endAsValue(this);
    }
    /**
    Returns a stream/property that ends the on first [`Error`](error.html) event. The
    error is included in the output of the returned Observable.
    
    @param  predicate   optional predicate function to determine whether to end on a given error
     */
    endOnError(predicate = x => true) {
        return endOnError(this, predicate);
    }
    /**
  Returns a stream containing [`Error`](error.html) events only.
  Same as filtering with a function that always returns false.
     */
    errors() {
        return this.filter(x => false).withDesc(new Desc(this, "errors"));
    }
    /**
  Filters values using given predicate function.
  Instead of a function, you can use a constant value (`true` to include all, `false` to exclude all).
  
  You can also filter values based on the value of a
  property. Event will be included in output [if and only if](http://en.wikipedia.org/wiki/If_and_only_if) the property holds `true`
  at the time of the event.
     */
    filter(f) {
        return filter$1(this, f);
    }
    /**
  Takes the first element from the stream. Essentially `observable.take(1)`.
     */
    first() {
        return take(1, this, new Desc(this, "first"));
    }
    /**
  Returns a Promise which will be resolved with the first event coming from an Observable.
  Like [`toPromise`](#topromise), the global ES6 promise implementation will be used unless a promise
  constructor is given.
     */
    firstToPromise(PromiseCtr) {
        return firstToPromise(this, PromiseCtr);
    }
    /**
  Works like [`scan`](#scan) but only emits the final
  value, i.e. the value just before the observable ends. Returns a
  [`Property`](property.html).
     */
    fold(seed, f) {
        return fold$1(this, seed, f);
    }
    /**
     An alias for [onValue](#onvalue).
  
     Subscribes a given handler function to the observable. Function will be called for each new value (not for errors or stream end).
     */
    forEach(f = nullSink) {
        // TODO: inefficient alias. Also, similar assign alias missing.
        return this.onValue(f);
    }
    /**
  Pauses and buffers the event stream if last event in valve is truthy.
  All buffered events are released when valve becomes falsy.
     */
    holdWhen(valve) {
        return holdWhen(this, valve);
    }
    inspect() { return this.toString(); }
    /**
     * Returns the true dependencies of the observable, including the intermediate "hidden" Observables.
     This method is for Bacon.js internal purposes but could be useful for debugging/analysis tools as well.
     See also: [deps](#deps)
     */
    internalDeps() {
        return this.initialDesc.deps();
    }
    /**
  Takes the last element from the stream. None, if stream is empty.
  
  
  *Note:* `neverEndingStream.last()` creates the stream which doesn't produce any events and never ends.
     */
    last() {
        return last$1(this);
    }
    /**
  Logs each value of the Observable to the console.
  It optionally takes arguments to pass to console.log() alongside each
  value. To assist with chaining, it returns the original Observable. Note
  that as a side-effect, the observable will have a constant listener and
  will not be garbage-collected. So, use this for debugging only and
  remove from production code. For example:
  
  ```js
  myStream.log("New event in myStream")
  ```
  
  or just
  
  ```js
  myStream.log()
  ```
  
     */
    log(...args) {
        log(args, this);
        return this;
    }
    /**
  Adds an extra [`Next`](next.html) event just before End. The value is created
  by calling the given function when the source stream ends. Instead of a
  function, a static value can be used.
     */
    // TODO: mapEnd and mapError signatures should allow V|V2
    mapEnd(f) {
        return this.transform(mapEndT(f), new Desc(this, "mapEnd", [f]));
    }
    /**
  Maps errors using given function. More
  specifically, feeds the "error" field of the error event to the function
  and produces a [`Next`](next.html) event based on the return value.
     */
    mapError(f) {
        return this.transform(mapErrorT(f), new Desc(this, "mapError", [f]));
    }
    /**
  Sets the name of the observable. Overrides the default
  implementation of [`toString`](#tostring) and `inspect`.
  Returns the same observable, with mutated name.
     */
    name(name) {
        this._name = name;
        return this;
    }
    /**
  Subscribes a callback to stream end. The function will be called when the stream ends.
  Just like `subscribe`, this method returns a function for unsubscribing.
     */
    onEnd(f = nullVoidSink) {
        return this.subscribe(function (event) {
            if (event.isEnd) {
                return f();
            }
            return more;
        });
    }
    /**
  Subscribes a handler to error events. The function will be called for each error in the stream.
  Just like `subscribe`, this method returns a function for unsubscribing.
     */
    onError(f = nullSink) {
        return this.subscribe(function (event) {
            if (isError(event)) {
                return f(event.error);
            }
            return more;
        });
    }
    /**
  Subscribes a given handler function to the observable. Function will be called for each new value.
  This is the simplest way to assign a side-effect to an observable. The difference
  to the `subscribe` method is that the actual stream values are
  received, instead of [`Event`](event) objects.
  Just like `subscribe`, this method returns a function for unsubscribing.
  `stream.onValue` and `property.onValue` behave similarly, except that the latter also
  pushes the initial value of the property, in case there is one.
     */
    onValue(f = nullSink) {
        return this.subscribe(function (event) {
            if (hasValue(event)) {
                return f(event.value);
            }
            return more;
        });
    }
    /**
  Like [`onValue`](#onvalue), but splits the value (assuming its an array) as function arguments to `f`.
  Only applicable for observables with arrays as values.
     */
    onValues(f) {
        return this.onValue(function (args) { return f(...args); });
    }
    /** A synonym for [scan](#scan).
     */
    reduce(seed, f) {
        return fold$1(this, seed, f);
    }
    sampledBy(sampler) {
        return sampledBy(this, sampler, arguments[1]); // TODO: combinator
    }
    /**
  Scans stream/property with given seed value and
  accumulator function, resulting to a Property. For example, you might
  use zero as seed and a "plus" function as the accumulator to create
  an "integral" property. Instead of a function, you can also supply a
  method name such as ".concat", in which case this method is called on
  the accumulator value and the new stream value is used as argument.
  
  Example:
  
  ```js
  var plus = function (a,b) { return a + b }
  Bacon.sequentially(1, [1,2,3]).scan(0, plus)
  ```
  
  This would result to following elements in the result stream:
  
      seed value = 0
      0 + 1 = 1
      1 + 2 = 3
      3 + 3 = 6
  
  When applied to a Property as in `r = p.scan(seed, f)`, there's a (hopefully insignificant) catch:
  The starting value for `r` depends on whether `p` has an
  initial value when scan is applied. If there's no initial value, this works
  identically to EventStream.scan: the `seed` will be the initial value of
  `r`. However, if `r` already has a current/initial value `x`, the
  seed won't be output as is. Instead, the initial value of `r` will be `f(seed, x)`. This makes sense,
  because there can only be 1 initial value for a Property at a time.
     */
    scan(seed, f) {
        return scan(this, seed, f);
    }
    /**
  Skips the first n elements from the stream
     */
    skip(count) {
        return skip(this, count);
    }
    /**
  Drops consecutive equal elements. So,
  from `[1, 2, 2, 1]` you'd get `[1, 2, 1]`. Uses the `===` operator for equality
  checking by default. If the isEqual argument is supplied, checks by calling
  isEqual(oldValue, newValue). For instance, to do a deep comparison,you can
  use the isEqual function from [underscore.js](http://underscorejs.org/)
  like `stream.skipDuplicates(_.isEqual)`.
     */
    skipDuplicates(isEqual) {
        return skipDuplicates(this, isEqual);
    }
    /**
     * Returns a new stream/property which excludes all [Error](error.html) events in the source
     */
    skipErrors() {
        return skipErrors(this);
    }
    /**
     Skips elements from the source, until a value event
     appears in the given `starter` stream/property. In other words, starts delivering values
     from the source after first value appears in `starter`.
     */
    skipUntil(starter) {
        return skipUntil(this, starter);
    }
    /**
     Skips elements until the given predicate function returns falsy once, and then
     lets all events pass through. Instead of a predicate you can also pass in a `Property<boolean>` to skip elements
     while the Property holds a truthy value.
     */
    skipWhile(f) {
        return skipWhile(this, f);
    }
    /**
  Returns a Property that represents a
  "sliding window" into the history of the values of the Observable. The
  result Property will have a value that is an array containing the last `n`
  values of the original observable, where `n` is at most the value of the
  `max` argument, and at least the value of the `min` argument. If the
  `min` argument is omitted, there's no lower limit of values.
  
  For example, if you have a stream `s` with value a sequence 1 - 2 - 3 - 4 - 5, the
  respective values in `s.slidingWindow(2)` would be [] - [1] - [1,2] -
  [2,3] - [3,4] - [4,5]. The values of `s.slidingWindow(2,2)`would be
  [1,2] - [2,3] - [3,4] - [4,5].
  
     */
    slidingWindow(maxValues, minValues = 0) {
        return slidingWindow(this, maxValues, minValues);
    }
    /**
     * subscribes given handler function to event stream. Function will receive [event](event.html) objects
     for all new value, end and error events in the stream.
     The subscribe() call returns a `unsubscribe` function that you can call to unsubscribe.
     You can also unsubscribe by returning [`Bacon.noMore`](../globals.html#nomore) from the handler function as a reply
     to an Event.
     `stream.subscribe` and `property.subscribe` behave similarly, except that the latter also
     pushes the initial value of the property, in case there is one.
  
     * @param {EventSink<V>} sink the handler function
     * @returns {Unsub}
     */
    subscribe(sink = nullSink) {
        return UpdateBarrier.wrappedSubscribe(this, sink => this.subscribeInternal(sink), sink);
    }
    /**
  Takes at most n values from the stream and then ends the stream. If the stream has
  fewer than n values then it is unaffected.
  Equal to [`Bacon.never()`](../globals.html#never) if `n <= 0`.
     */
    take(count) {
        return take(count, this);
    }
    /**
  Takes elements from source until a value event appears in the other stream.
  If other stream ends without value, it is ignored.
     */
    takeUntil(stopper) {
        return takeUntil(this, stopper);
    }
    /**
  Takes while given predicate function holds true, and then ends. Alternatively, you can supply a boolean Property to take elements while the Property holds `true`.
     */
    takeWhile(f) {
        return takeWhile(this, f);
    }
    /**
  Throttles stream/property by given amount
  of milliseconds. Events are emitted with the minimum interval of
  [`delay`](#observable-delay). The implementation is based on [`stream.bufferWithTime`](#stream-bufferwithtime).
  Does not affect emitting the initial value of a [`Property`](#property).
  
  Example:
  
  ```js
  var throttled = source.throttle(2)
  ```
  
  ```
  source:    asdf----asdf----
  throttled: --s--f----s--f--
  ```
     */
    throttle(minimumInterval) {
        return throttle(this, minimumInterval);
    }
    /**
  Returns a Promise which will be resolved with the last event coming from an Observable.
  The global ES6 promise implementation will be used unless a promise constructor is given.
  Use a shim if you need to support legacy browsers or platforms.
  [caniuse promises](http://caniuse.com/#feat=promises).
  
  See also [firstToPromise](#firsttopromise).
     */
    toPromise(PromiseCtr) {
        return toPromise(this, PromiseCtr);
    }
    /**
     *Returns a textual description of the Observable. For instance, `Bacon.once(1).map(function() {}).toString()` would return "Bacon.once(1).map(function)".
     **/
    toString() {
        if (this._name) {
            return this._name;
        }
        else {
            return this.desc.toString();
        }
    }
    withDesc(desc) {
        if (desc)
            this.desc = desc;
        return this;
    }
    /**
  Sets the structured description of the observable. The [`toString`](#tostring) and `inspect` methods
  use this data recursively to create a string representation for the observable. This method
  is probably useful for Bacon core / library / plugin development only.
  
  For example:
  
      var src = Bacon.once(1)
      var obs = src.map(function(x) { return -x })
      console.log(obs.toString())
      --> Bacon.once(1).map(function)
      obs.withDescription(src, "times", -1)
      console.log(obs.toString())
      --> Bacon.once(1).times(-1)
  
  The method returns the same observable with mutated description.
  
  */
    withDescription(context, method, ...args) {
        this.desc = describe(context, method, ...args);
        return this;
    }
    /**
  Returns an EventStream with elements
  pair-wise lined up with events from this and the other EventStream or Property.
  A zipped stream will publish only when it has a value from each
  source and will only produce values up to when any single source ends.
  
  The given function `f` is used to create the result value from value in the two
  sources. If no function is given, the values are zipped into an array.
  
  Be careful not to have too much "drift" between streams. If one stream
  produces many more values than some other excessive buffering will
  occur inside the zipped observable.
  
  Example 1:
  
  ```js
  var x = Bacon.fromArray([1, 2])
  var y = Bacon.fromArray([3, 4])
  x.zip(y, function(x, y) { return x + y })
  
  # produces values 4, 6
  ```
  
  See also [`zipWith`](../globals.html#zipwith) and [`zipAsArray`](../globals.html/zipasarray) for zipping more than 2 sources.
  
     */
    zip(other, f) {
        return zip(this, other, f);
    }
}
/**
 A reactive property. Has the concept of "current value".
 You can create a Property from an EventStream by using either [`toProperty`](eventstream.html#toproperty)
 or [`scan`](eventstream.html#scan) method. Note: depending on how a Property is created, it may or may not
 have an initial value. The current value stays as its last value after the stream has ended.

 Here are the most common ways for creating Properties:

 - Create a constant property with [constant](../globals.html#constant)
 - Create a property based on an EventStream with [toProperty](eventstream.html#toproperty)
 - Scan an EventStream with an accumulator function with [scan](eventstream.html#scan)
 - Create a state property based on multiple sources using [update](../globals.html#update)

 @typeparam V   Type of the elements/values in the stream/property
 */
class Property extends Observable {
    constructor(desc, subscribe, handler) {
        super(desc);
        /** @internal */
        this._isProperty = true;
        assertFunction(subscribe);
        this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
        registerObs(this);
    }
    /**
     Combines properties with the `&&` operator. It produces a new value when either of the Properties change,
     combining the latest values using `&&`.
     */
    and(other) {
        return and(this, other);
    }
    /**
     * creates a stream of changes to the Property. The stream *does not* include
     an event for the current value of the Property at the time this method was called.
     */
    changes() {
        return new EventStream(new Desc(this, "changes", []), (sink) => this.dispatcher.subscribe(function (event) {
            if (!event.isInitial) {
                return sink(event);
            }
            return more;
        }));
    }
    concat(other) {
        return this.transformChanges(describe(this, "concat", other), changes => changes.concat(other));
    }
    /** @hidden */
    transformChanges(desc, f) {
        return transformPropertyChanges(this, f, desc);
    }
    /**
     For each element in the source stream, spawn a new
     stream/property using the function `f`. Collect events from each of the spawned
     streams into the result property. Note that instead of a function, you can provide a
     stream/property too. Also, the return value of function `f` can be either an
     `Observable` (stream/property) or a constant value.
  
     `stream.flatMap()` can be used conveniently with [`Bacon.once()`](../globals.html#once) and [`Bacon.never()`](../globals.html#never)
     for converting and filtering at the same time, including only some of the results.
  
     Example - converting strings to integers, skipping empty values:
  
     ```js
     stream.flatMap(function(text) {
      return (text != "") ? parseInt(text) : Bacon.never()
  })
     ```
     */
    flatMap(f) {
        return flatMap$1(this, f);
    }
    /**
     A [`flatMapWithConcurrencyLimit`](#flatmapwithconcurrencylimit) with limit of 1.
     */
    flatMapConcat(f) {
        return flatMapConcat(this, f);
    }
    /**
     Like [`flatMap`](#flatmap), but is applied only on [`Error`](error.html) events. Returned values go into the
     value stream, unless an error event is returned. As an example, one type of error could result in a retry and another just
     passed through, which can be implemented using flatMapError.
     */
    flatMapError(f) {
        return flatMapError(this, f);
    }
    flatMapEvent(f) {
        return flatMapEvent(this, f);
    }
    /**
     Like [`flatMap`](#observable-flatmap), but only spawns a new
     stream if the previously spawned stream has ended.
     */
    flatMapFirst(f) {
        return flatMapFirst(this, f);
    }
    /**
     Like [`flatMap`](#flatmap), but instead of including events from
     all spawned streams, only includes them from the latest spawned stream.
     You can think this as switching from stream to stream.
     Note that instead of a function, you can provide a stream/property too.
     */
    flatMapLatest(f) {
        return flatMapLatest(this, f);
    }
    /**
     A super method of *flatMap* family. It limits the number of open spawned streams and buffers incoming events.
     [`flatMapConcat`](#flatmapconcat) is `flatMapWithConcurrencyLimit(1)` (only one input active),
     and [`flatMap`](#flatmap) is `flatMapWithConcurrencyLimit ∞` (all inputs are piped to output).
     */
    flatMapWithConcurrencyLimit(limit, f) {
        return flatMapWithConcurrencyLimit(this, limit, f);
    }
    /**
     Groups stream events to new streams by `keyF`. Optional `limitF` can be provided to limit grouped
     stream life. Stream transformed by `limitF` is passed on if provided. `limitF` gets grouped stream
     and the original event causing the stream to start as parameters.
  
     Calculator for grouped consecutive values until group is cancelled:
  
     ```
     var events = [
     {id: 1, type: "add", val: 3 },
     {id: 2, type: "add", val: -1 },
     {id: 1, type: "add", val: 2 },
     {id: 2, type: "cancel"},
     {id: 3, type: "add", val: 2 },
     {id: 3, type: "cancel"},
     {id: 1, type: "add", val: 1 },
     {id: 1, type: "add", val: 2 },
     {id: 1, type: "cancel"}
     ]
  
     function keyF(event) {
    return event.id
  }
  
     function limitF(groupedStream, groupStartingEvent) {
    var cancel = groupedStream.filter(function(x) { return x.type === "cancel"}).take(1)
    var adds = groupedStream.filter(function(x) { return x.type === "add" })
    return adds.takeUntil(cancel).map(".val")
  }
  
     Bacon.sequentially(2, events)
     .groupBy(keyF, limitF)
     .flatMap(function(groupedStream) {
      return groupedStream.fold(0, function(acc, x) { return acc + x })
    })
     .onValue(function(sum) {
      console.log(sum)
      // returns [-1, 2, 8] in an order
    })
     ```
  
     */
    groupBy(keyF, limitF) {
        return groupBy(this, keyF, limitF);
    }
    /**
     Maps values using given function, returning a new
     stream/property. Instead of a function, you can also provide a [Property](property.html),
     in which case each element in the source stream will be mapped to the current value of
     the given property.
     */
    map(f) {
        return map$1(this, f);
    }
    /** Returns a Property that inverts the value of this one (using the `!` operator). **/
    not() {
        return not(this);
    }
    /**
     Combines properties with the `||` operator. It produces a new value when either of the Properties change,
     combining the latest values using `||`.
     */
    or(other) {
        return or(this, other);
    }
    /**
     Creates an EventStream by sampling the
     property value at given interval (in milliseconds)
     */
    sample(interval) {
        return sampleP(this, interval);
    }
    /**
    Adds an initial "default" value for the
    Property. If the Property doesn't have an initial value of it's own, the
    given value will be used as the initial value. If the property has an
    initial value of its own, the given value will be ignored.
     */
    startWith(seed) {
        return startWithP(this, seed);
    }
    /** @hidden */
    subscribeInternal(sink = nullSink) {
        return this.dispatcher.subscribe(sink);
    }
    /**
     Creates an EventStream based on this Property. The stream contains also an event for the current
     value of this Property at the time this method was called.
     */
    toEventStream(options) {
        return new EventStream(new Desc(this, "toEventStream", []), (sink) => this.subscribeInternal(function (event) {
            return sink(event.toNext());
        }), undefined, options);
    }
    /**
     Returns the Property itself.
     */
    toProperty() {
        assertNoArguments(arguments);
        return this;
    }
    transform(transformer, desc) {
        return transformP(this, transformer, desc);
    }
    /**
     Creates an EventStream/Property by sampling a given `samplee`
     stream/property value at each event from the this stream/property.
  
     @param {Observable<V2>} samplee
     @param f function to select/calculate the result value based on the value in the source stream and the samplee
  
     @typeparam V2  type of values in the samplee
     @typeparam R   type of values in the result
     */
    withLatestFrom(samplee, f) {
        return withLatestFromP(this, samplee, f);
    }
    /**
     Lets you run a state machine
     on an observable. Give it an initial state object and a state
     transformation function that processes each incoming event and
     returns an array containing the next state and an array of output
     events. Here's an example where we calculate the total sum of all
     numbers in the stream and output the value on stream end:
  
     ```js
     Bacon.fromArray([1,2,3])
     .withStateMachine(0, function(sum, event) {
      if (event.hasValue)
        return [sum + event.value, []]
      else if (event.isEnd)
        return [undefined, [new Bacon.Next(sum), event]]
      else
        return [sum, [event]]
    })
     ```
     @param initState  initial state for the state machine
     @param f          the function that defines the state machine
     @typeparam  State   type of machine state
     @typeparam  Out     type of values to be emitted
     */
    withStateMachine(initState, f) {
        return withStateMachine(initState, f, this);
    }
}
/** @hidden */
function isProperty(x) {
    return !!x._isProperty;
}
// allowSync option is used for overriding the "force async" behaviour or EventStreams.
// ideally, this should not exist, but right now the implementation of some operations
// relies on using internal EventStreams that have synchronous behavior. These are not exposed
// to the outside world, though.
/** @hidden */
const allowSync = { forceAsync: false };
/**
 * EventStream represents a stream of events. It is an Observable object, meaning
 that you can listen to events in the stream using, for instance, the [`onValue`](#onvalue) method
 with a callback.

 To create an EventStream, you'll want to use one of the following factory methods:

  - From DOM EventTarget or Node.JS EventEmitter objects using [fromEvent](../globals.html#fromevent)
  - From a Promise using [fromPromise](../globals.html#frompromise)
  - From an unary callback using [fromCallback](../globals.html#fromcallback)
  - From a Node.js style callback using [fromNodeCallback](../globals.html#fromnodecallback)
  - From RxJs or Kefir observables using [fromESObservable](../globals.html#fromesobservable)
  - By polling a synchronous function using [fromPoll](../globals.html#fromPoll)
  - Emit a single event instantly using [once](../globals.html#once)
  - Emit a single event with a delay [later](../globals.html#later)
  - Emit the same event indefinitely using [interval](../globals.html#interval)
  - Emit an array of events instantly [fromArray](../globals.html#fromarray)
  - Emit an array of events with a delay [sequentially](../globals.html#sequentially)
  - Emit an array of events repeatedly with a delay [repeatedly](../globals.html#repeatedly)
  - Use a generator function to be called repeatedly [repeat](../globals.html#repeat)
  - Create a stream that never emits an event, ending immediately [never](../globals.html#never)
  - Create a stream that never emits an event, ending with a delay [silence](../globals.html#silence)
  - Create stream using a custom binder function [fromBinder](../globals.html#frombinder)
  - Wrap jQuery events using [asEventStream](../globals.html#_)


 @typeparam V   Type of the elements/values in the stream/property

 */
class EventStream extends Observable {
    constructor(desc, subscribe, handler, options) {
        super(desc);
        /** @hidden */
        this._isEventStream = true;
        if (options !== allowSync) {
            subscribe = asyncWrapSubscribe(this, subscribe);
        }
        this.dispatcher = new Dispatcher(this, subscribe, handler);
        registerObs(this);
    }
    /**
     Buffers stream events with given delay.
     The buffer is flushed at most once in the given interval. So, if your input
     contains [1,2,3,4,5,6,7], then you might get two events containing [1,2,3,4]
     and [5,6,7] respectively, given that the flush occurs between numbers 4 and 5.
  
     Also works with a given "defer-function" instead
     of a delay. Here's a simple example, which is equivalent to
     stream.bufferWithTime(10):
  
     ```js
     stream.bufferWithTime(function(f) { setTimeout(f, 10) })
     ```
  
     * @param delay buffer duration in milliseconds
     */
    bufferWithTime(delay) {
        return bufferWithTime(this, delay);
    }
    /**
     Buffers stream events with given count.
     The buffer is flushed when it contains the given number of elements or the source stream ends.
  
     So, if you buffer a stream of `[1, 2, 3, 4, 5]` with count `2`, you'll get output
     events with values `[1, 2]`, `[3, 4]` and `[5]`.
  
     * @param {number} count
     */
    bufferWithCount(count) {
        return bufferWithCount(this, count);
    }
    /**
     Buffers stream events and
     flushes when either the buffer contains the given number elements or the
     given amount of milliseconds has passed since last buffered event.
  
     * @param {number | DelayFunction} delay in milliseconds or as a function
     * @param {number} count  maximum buffer size
     */
    bufferWithTimeOrCount(delay, count) {
        return bufferWithTimeOrCount(this, delay, count);
    }
    changes() {
        return this;
    }
    concat(other, options) {
        return concatE(this, other, options);
    }
    /** @hidden */
    transformChanges(desc, f) {
        return f(this).withDesc(desc);
    }
    /**
     For each element in the source stream, spawn a new
     stream/property using the function `f`. Collect events from each of the spawned
     streams into the result stream/property. Note that instead of a function, you can provide a
     stream/property too. Also, the return value of function `f` can be either an
     `Observable` (stream/property) or a constant value.
  
     `stream.flatMap()` can be used conveniently with [`Bacon.once()`](../globals.html#once) and [`Bacon.never()`](../globals.html#never)
     for converting and filtering at the same time, including only some of the results.
  
     Example - converting strings to integers, skipping empty values:
  
     ```js
     stream.flatMap(function(text) {
      return (text != "") ? parseInt(text) : Bacon.never()
  })
     ```
     */
    flatMap(f) { return flatMap$1(this, f); }
    /**
     A [`flatMapWithConcurrencyLimit`](#flatmapwithconcurrencylimit) with limit of 1.
     */
    flatMapConcat(f) { return flatMapConcat(this, f); }
    /**
     Like [`flatMap`](#flatmap), but is applied only on [`Error`](error.html) events. Returned values go into the
     value stream, unless an error event is returned. As an example, one type of error could result in a retry and another just
     passed through, which can be implemented using flatMapError.
     */
    flatMapError(f) { return flatMapError(this, f); }
    /**
     Like [`flatMap`](#observable-flatmap), but only spawns a new
     stream if the previously spawned stream has ended.
     */
    flatMapFirst(f) { return flatMapFirst(this, f); }
    /**
     Like [`flatMap`](#flatmap), but instead of including events from
     all spawned streams, only includes them from the latest spawned stream.
     You can think this as switching from stream to stream.
     Note that instead of a function, you can provide a stream/property too.
     */
    flatMapLatest(f) { return flatMapLatest(this, f); }
    /**
     A super method of *flatMap* family. It limits the number of open spawned streams and buffers incoming events.
     [`flatMapConcat`](#flatmapconcat) is `flatMapWithConcurrencyLimit(1)` (only one input active),
     and [`flatMap`](#flatmap) is `flatMapWithConcurrencyLimit ∞` (all inputs are piped to output).
     */
    flatMapWithConcurrencyLimit(limit, f) { return flatMapWithConcurrencyLimit(this, limit, f); }
    flatMapEvent(f) { return flatMapEvent(this, f); }
    /**
     Scans stream with given seed value and accumulator function, resulting to a Property.
     Difference to [`scan`](#scan) is that the function `f` can return an [`EventStream`](eventstream.html) or a [`Property`](property.html) instead
     of a pure value, meaning that you can use [`flatScan`](#flatscan) for asynchronous updates of state. It serializes
     updates so that that the next update will be queued until the previous one has completed.
  
     * @param seed initial value to start with
     * @param f transition function from previous state and new value to next state
     * @typeparam V2 state and result type
     */
    flatScan(seed, f) {
        return flatScan(this, seed, f);
    }
    /**
     Groups stream events to new streams by `keyF`. Optional `limitF` can be provided to limit grouped
     stream life. Stream transformed by `limitF` is passed on if provided. `limitF` gets grouped stream
     and the original event causing the stream to start as parameters.
  
     Calculator for grouped consecutive values until group is cancelled:
  
     ```
     var events = [
     {id: 1, type: "add", val: 3 },
     {id: 2, type: "add", val: -1 },
     {id: 1, type: "add", val: 2 },
     {id: 2, type: "cancel"},
     {id: 3, type: "add", val: 2 },
     {id: 3, type: "cancel"},
     {id: 1, type: "add", val: 1 },
     {id: 1, type: "add", val: 2 },
     {id: 1, type: "cancel"}
     ]
  
     function keyF(event) {
    return event.id
  }
  
     function limitF(groupedStream, groupStartingEvent) {
    var cancel = groupedStream.filter(function(x) { return x.type === "cancel"}).take(1)
    var adds = groupedStream.filter(function(x) { return x.type === "add" })
    return adds.takeUntil(cancel).map(".val")
  }
  
     Bacon.sequentially(2, events)
     .groupBy(keyF, limitF)
     .flatMap(function(groupedStream) {
      return groupedStream.fold(0, function(acc, x) { return acc + x })
    })
     .onValue(function(sum) {
      console.log(sum)
      // returns [-1, 2, 8] in an order
    })
     ```
  
     */
    groupBy(keyF, limitF) {
        return groupBy(this, keyF, limitF);
    }
    /**
   Maps values using given function, returning a new
   stream/property. Instead of a function, you can also provide a [Property](property.html),
   in which case each element in the source stream will be mapped to the current value of
   the given property.
   */
    map(f) {
        return map$1(this, f);
    }
    merge(other) {
        assertEventStream(other);
        return mergeAll(this, other).withDesc(new Desc(this, "merge", [other]));
    }
    /**
     Returns a stream/property that inverts boolean values (using `!`)
     */
    not() { return not(this); }
    /**
     Adds a starting value to the stream/property, i.e. concats a
     single-element stream containing the single seed value  with this stream.
     */
    // TODO: should allow V|V2 signature
    startWith(seed) {
        return startWithE(this, seed);
    }
    /** @hidden */
    subscribeInternal(sink = nullSink) {
        return this.dispatcher.subscribe(sink);
    }
    /**
     * Returns this stream.
     */
    toEventStream() { return this; }
    /**
     Creates a Property based on the
     EventStream.
  
     Without arguments, you'll get a Property without an initial value.
     The Property will get its first actual value from the stream, and after that it'll
     always have a current value.
  
     You can also give an initial value that will be used as the current value until
     the first value comes from the stream.
     */
    toProperty(initValue) {
        let usedInitValue = arguments.length
            ? toOption(initValue)
            : none();
        let disp = this.dispatcher;
        let desc = new Desc(this, "toProperty", Array.prototype.slice.apply(arguments));
        let streamSubscribe = disp.subscribe;
        return new Property(desc, streamSubscribeToPropertySubscribe(usedInitValue, streamSubscribe));
    }
    transform(transformer, desc) {
        return transformE(this, transformer, desc);
    }
    /**
     Creates an EventStream/Property by sampling a given `samplee`
     stream/property value at each event from the this stream/property.
  
     @param {Observable<V2>} samplee
     @param f function to select/calculate the result value based on the value in the source stream and the samplee
  
     @typeparam V2  type of values in the samplee
     @typeparam R   type of values in the result
     */
    withLatestFrom(samplee, f) {
        return withLatestFromE(this, samplee, f);
    }
    /**
     Lets you run a state machine
     on an observable. Give it an initial state object and a state
     transformation function that processes each incoming event and
     returns an array containing the next state and an array of output
     events. Here's an example where we calculate the total sum of all
     numbers in the stream and output the value on stream end:
  
     ```js
     Bacon.fromArray([1,2,3])
     .withStateMachine(0, function(sum, event) {
      if (event.hasValue)
        return [sum + event.value, []]
      else if (event.isEnd)
        return [undefined, [new Bacon.Next(sum), event]]
      else
        return [sum, [event]]
    })
     ```
     @param initState  initial state for the state machine
     @param f          the function that defines the state machine
     @typeparam  State   type of machine state
     @typeparam  Out     type of values to be emitted
     */
    withStateMachine(initState, f) {
        return withStateMachine(initState, f, this);
    }
}
/** @hidden */
function newEventStream(description, subscribe) {
    return new EventStream(description, subscribe);
}
/** @hidden */
function newEventStreamAllowSync(description, subscribe) {
    return new EventStream(description, subscribe, undefined, allowSync);
}

function symbol(key) {
    if (typeof Symbol !== "undefined" && Symbol[key]) {
        return Symbol[key];
    }
    else if (typeof Symbol !== "undefined" && typeof Symbol.for === "function") {
        return Symbol[key] = Symbol.for(key);
    }
    else {
        return "@@" + key;
    }
}

class ESObservable {
    constructor(observable) {
        this.observable = observable;
    }
    subscribe(observerOrOnNext, onError, onComplete) {
        const observer = typeof observerOrOnNext === 'function'
            ? { next: observerOrOnNext, error: onError, complete: onComplete }
            : observerOrOnNext;
        const subscription = {
            closed: false,
            unsubscribe: function () {
                subscription.closed = true;
                cancel();
            }
        };
        const cancel = this.observable.subscribe(function (event) {
            if (hasValue(event) && observer.next) {
                observer.next(event.value);
            }
            else if (isError(event)) {
                if (observer.error)
                    observer.error(event.error);
                subscription.unsubscribe();
            }
            else if (event.isEnd) {
                subscription.closed = true;
                if (observer.complete)
                    observer.complete();
            }
        });
        return subscription;
    }
}
ESObservable.prototype[symbol('observable')] = function () {
    return this;
};
Observable.prototype.toESObservable = function () {
    return new ESObservable(this);
};
Observable.prototype[symbol('observable')] = Observable.prototype.toESObservable;

/**
 Creates a Property from an initial value and updates the value based on multiple inputs.
 The inputs are defined similarly to [`Bacon.when`](#bacon-when), like this:

 ```js
 var result = Bacon.update(
 initial,
 [x,y,z, (previous,x,y,z) => { ... }],
 [x,y,   (previous,x,y) => { ... }])
 ```

 As input, each function above will get the previous value of the `result` Property, along with values from the listed Observables.
 The value returned by the function will be used as the next value of `result`.

 Just like in [`Bacon.when`](#when), only EventStreams will trigger an update, while Properties will be just sampled.
 So, if you list a single EventStream and several Properties, the value will be updated only when an event occurs in the EventStream.

 Here's a simple gaming example:

 ```js
 let scoreMultiplier = Bacon.constant(1)
 let hitUfo = Bacon.interval(1000)
 let hitMotherShip = Bacon.later(10000)
 let score = Bacon.update(
 0,
 [hitUfo, scoreMultiplier, (score, _, multiplier) => score + 100 * multiplier ],
 [hitMotherShip, (score, _) => score + 2000 ]
 )
 ```

 In the example, the `score` property is updated when either `hitUfo` or `hitMotherShip` occur. The `scoreMultiplier` Property is sampled to take multiplier into account when `hitUfo` occurs.

 * @param initial
 * @param {UpdatePattern<Out>} patterns
 * @returns {Property<Out>}
 */
function update(initial, ...patterns) {
    let rawPatterns = extractRawPatterns(patterns);
    for (var i = 0; i < rawPatterns.length; i++) {
        let pattern = rawPatterns[i];
        pattern[1] = lateBindFirst(pattern[1]);
    }
    return when(...rawPatterns).scan(initial, (function (x, f) {
        return f(x);
    })).withDesc(new Desc("Bacon", "update", [initial, ...patterns]));
}
function lateBindFirst(f) {
    return function (...args) {
        return function (i) {
            return f(...[i].concat(args));
        };
    };
}

/**
 Creates an EventStream that delivers the given
 series of values (given as array) to the first subscriber. The stream ends after these
 values have been delivered. You can also send [`Bacon.Error`](classes/error.html) events, or
 any combination of pure values and error events like this:
 `Bacon.fromArray([1, new Bacon.Error()])

 @param   values    Array of values or events to repeat
 @typeparam V Type of stream elements
 */
function fromArray(values) {
    assertArray(values);
    if (!values.length) {
        return never().withDesc(new Desc("Bacon", "fromArray", values));
    }
    else {
        var i = 0;
        var stream = new EventStream(new Desc("Bacon", "fromArray", [values]), function (sink) {
            var unsubd = false;
            var reply = more;
            var pushing = false;
            var pushNeeded = false;
            function push() {
                pushNeeded = true;
                if (pushing) {
                    return;
                }
                if (i === values.length) {
                    sink(endEvent());
                    return false;
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

function isEventSourceFn(x) {
    return _.isFunction(x);
}
// Wrap DOM EventTarget, Node EventEmitter, or
// [un]bind: (Any, (Any) -> None) -> None interfaces
// common in MVCs as EventStream
//
// target - EventTarget or EventEmitter, source of events
// eventSource - event name to bind or a function that performs custom binding
// eventTransformer - defaults to returning the first argument to handler
//
// Example 1:
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
/** @hidden */
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
/**
 creates an EventStream from events
 on a DOM EventTarget or Node.JS EventEmitter object, or an object that supports event listeners using `on`/`off` methods.
 You can also pass an optional function that transforms the emitted
 events' parameters.

 The simple form:

 ```js
 Bacon.fromEvent(document.body, "click").onValue(function() { alert("Bacon!") })
 ```

 Using a binder function:

 ```js
 Bacon.fromEvent(
 window,
 function(binder, listener) {
    binder("scroll", listener, {passive: true})
  }
 ).onValue(function() {
  console.log(window.scrollY)
})
 ```

 @param target
 @param eventSource
 @param eventTransformer
 @typeparam V Type of stream elements

 */
function fromEvent(target, eventSource, eventTransformer) {
    var [sub, unsub] = findHandlerMethods(target);
    var desc = new Desc("Bacon", "fromEvent", [target, eventSource]);
    return fromBinder(function (handler) {
        if (isEventSourceFn(eventSource)) {
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

/**
 A shorthand for combining multiple
 sources (streams, properties, constants) as array and assigning the
 side-effect function f for the values. The following example would log
 the number 3.

 ```js
 function f(a, b) { console.log(a + b) }
 Bacon.onValues(Bacon.constant(1), Bacon.constant(2), f)
 ```
 */
function onValues(...args) {
    return combineAsArray(args.slice(0, args.length - 1)).onValues(args[arguments.length - 1]);
}

/**
 Calls generator function which is expected to return an observable. The returned EventStream contains
 values and errors from the spawned observable. When the spawned observable ends, the generator is called
 again to spawn a new observable.

 This is repeated until the generator returns a falsy value
 (such as `undefined` or `false`).

 The generator function is called with one argument — iteration number starting from `0`.

 Here's an example:

```js
Bacon.repeat(function(i) {
if (i < 3) {
  return Bacon.once(i);
} else {
  return false;
}
}).log()
```

 The example will produce values 0, 1 and 2.

 @param {(number) => (Observable<V> | null)} generator
 @returns {EventStream<V>}
 @typeparam V Type of stream elements

 */
function repeat(generator) {
    var index = 0;
    return fromBinder(function (sink) {
        var flag = false;
        var reply = more;
        var unsub = function () { };
        function handleEvent(event) {
            if (event.isEnd) {
                if (!flag) {
                    flag = true;
                }
                else {
                    subscribeNext();
                }
                return more;
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
            flag = true;
        }
        subscribeNext();
        return () => unsub();
    }).withDesc(new Desc("Bacon", "repeat", [generator]));
}

/**
 Repeats given elements indefinitely
 with given interval in milliseconds. For example, `repeatedly(10, [1,2,3])`
 would lead to `1,2,3,1,2,3...` to be repeated indefinitely.

 @param delay between values, in milliseconds
 @param values array of values to repeat
 @typeparam V Type of stream elements

 */
function repeatedly(delay, values) {
    var index = 0;
    return fromPoll(delay, function () {
        return values[index++ % values.length];
    }).withDesc(new Desc("Bacon", "repeatedly", [delay, values]));
}

/**
 Creates a stream that ends after given amount of milliseconds, without emitting any values.

 @param duration duration of silence in milliseconds
 @typeparam V Type of stream elements
 */
function silence(duration) {
    return later(duration, "")
        .filter(false)
        .withDesc(new Desc("Bacon", "silence", [duration]));
}

/**
 Used to retry the call when there is an [`Error`](classes/error.html) event in the stream produced by the `source` function.

 ```js
 var triggeringStream, ajaxCall // <- ajaxCall gives Errors on network or server errors
 ajaxResult = triggeringStream.flatMap(function(url) {
    return Bacon.retry({
        source: function(attemptNumber) { return ajaxCall(url) },
        retries: 5,
        isRetryable: function (error) { return error.httpStatusCode !== 404; },
        delay: function(context) { return 100; } // Just use the same delay always
    })
})
 ```
 * @param options (click for details)
 */
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
    return repeat(function (count) {
        function valueStream() {
            return source(count).endOnError().transform(function (event, sink) {
                if (isError(event)) {
                    errorEvent = event;
                    if (!(isRetryable(errorEvent.error) && (retries === 0 || retriesDone < retries))) {
                        finished = true;
                        return sink(event);
                    }
                    else {
                        return more;
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
            return undefined;
        }
        else if (errorEvent) {
            var context = {
                error: errorEvent.error,
                retriesDone
            };
            var pause = silence(delay(context));
            retriesDone++;
            return pause.concat(once(null).flatMap(valueStream));
        }
        else {
            return valueStream();
        }
    }).withDesc(new Desc("Bacon", "retry", [options]));
}

/**
 Creates a stream containing given
 values (given as array). Delivered with given interval in milliseconds.

 @param delay between elements, in milliseconds
 @param array of values or events
 @typeparam V Type of stream elements

 */
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
    }).withDesc(new Desc("Bacon", "sequentially", [delay, values]));
}

function valueAndEnd(value) {
    return [toEvent(value), endEvent()];
}
/**
 * Creates an EventStream from a Promise object such as JQuery Ajax.
 This stream will contain a single value or an error, followed immediately by stream end.
 You can use the optional abort flag (i.e. ´fromPromise(p, true)´ to have the `abort` method of the given promise be called when all subscribers have been removed from the created stream.
 You can also pass an optional function that transforms the promise value into Events. The default is to transform the value into `[new Bacon.Next(value), new Bacon.End()]`.
 Check out this [example](https://github.com/raimohanska/baconjs-examples/blob/master/resources/public/index.html).

 *
 * @param {Promise<V>} source promise object
 * @param abort should we call the `abort` method of the Promise on unsubscribe. This is a nonstandard feature you should probably ignore.
 * @param {EventTransformer<V>} eventTransformer
 * @returns {EventStream<V>}
 */
function fromPromise(promise, abort, eventTransformer = valueAndEnd) {
    return fromBinder(function (handler) {
        const bound = promise.then(handler, (e) => handler(new Error$1(e)));
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
    }, eventTransformer).withDesc(new Desc("Bacon", "fromPromise", [promise]));
}

function withMethodCallSupport(wrapped) {
    return function (f, ...args) {
        if (typeof f === "object" && args.length) {
            var context = f;
            var methodName = args[0];
            f = function (...args) {
                return context[methodName](...args);
            };
            args = args.slice(1);
        }
        return wrapped(f, ...args);
    };
}
function partiallyApplied(f, applied) {
    return function (...args) { return f(...(applied.concat(args))); };
}
const makeFunction_ = withMethodCallSupport(function (f, ...args) {
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
/** @hidden */
function makeFunction(f, args) {
    return makeFunction_(f, ...args);
}

// TODO: types/doc for the object, fnname variant
/**
 Creates an EventStream from a function that
 accepts a callback. The function is supposed to call its callback just
 once. For example:

 ```js
 Bacon.fromCallback(callback => callback("bacon"))
 ```

 This would create a stream that outputs a single value "Bacon!" and ends
 after that. The use of setTimeout causes the value to be delayed by 1
 second.

 You can also give any number of arguments to [`fromCallback`](#bacon-fromcallback), which will be
 passed to the function. These arguments can be simple variables, Bacon
 EventStreams or Properties. For example the following will output "Bacon rules":

 ```js
 bacon = Bacon.constant('bacon')
 Bacon.fromCallback(function(a, b, callback) {
  callback(a + ' ' + b);
}, bacon, 'rules').log();
 ```

 * @param f
 * @param args
 * @returns {EventStream<V>}
 */
function fromCallback(f, ...args) {
    return fromBinder(function (handler) {
        makeFunction(f, args)(handler);
        return nop;
    }, function (value) {
        return [value, endEvent()];
    }).withDesc(new Desc("Bacon", "fromCallback", [f, ...args]));
}
/**
Behaves the same way as `Bacon.fromCallback`,
except that it expects the callback to be called in the Node.js convention:
`callback(error, data)`, where error is null if everything is fine. For example:

```js
var Bacon = require('baconjs').Bacon,
fs = require('fs');
var read = Bacon.fromNodeCallback(fs.readFile, 'input.txt');
read.onError(function(error) { console.log("Reading failed: " + error); });
read.onValue(function(value) { console.log("Read contents: " + value); });
```

 */
function fromNodeCallback(f, ...args) {
    return fromBinder(function (handler) {
        makeFunction(f, args)(handler);
        return nop;
    }, function (error, value) {
        if (error) {
            return [new Error$1(error), endEvent()];
        }
        return [value, endEvent()];
    }).withDesc(new Desc("Bacon", "fromNodeCallback", [f, ...args]));
}

/**
 * Creates an EventStream from an
 [ES Observable](https://github.com/tc39/proposal-observable). Input can be any
 ES Observable implementation including RxJS and Kefir.
 */
function fromESObservable(_observable) {
    var observable;
    if (_observable[symbol("observable")]) {
        observable = _observable[symbol("observable")]();
    }
    else {
        observable = _observable;
    }
    var desc = new Desc("Bacon", "fromESObservable", [observable]);
    return new EventStream(desc, function (sink) {
        var cancel = observable.subscribe({
            error: function (x) {
                sink(new Error$1(x));
                sink(new End());
            },
            next: function (value) { sink(new Next(value)); },
            complete: function () {
                sink(new End());
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

/**
 An [`EventStream`](eventstream.html) that allows you to [`push`](#push) values into the stream.

 It also allows plugging other streams into the Bus, as inputs. The Bus practically
 merges all plugged-in streams and the values pushed using the [`push`](#push)
 method.
 */
class Bus extends EventStream {
    constructor() {
        super(new Desc("Bacon", "Bus", []), (sink) => this.subscribeAll(sink));
        /** @hidden */
        this.pushing = false;
        /** @hidden */
        this.pushQueue = undefined;
        /** @hidden */
        this.ended = false;
        /** @hidden */
        this.subscriptions = [];
        this.unsubAll = _.bind(this.unsubAll, this);
        this.push = _.bind(this.push, this);
        this.subscriptions = []; // new array for each Bus instance
        this.ended = false;
    }
    /**
     Plugs the given stream as an input to the Bus. All events from
     the given stream will be delivered to the subscribers of the Bus.
     Returns a function that can be used to unplug the same stream.
  
     The plug method practically allows you to merge in other streams after
     the creation of the Bus.
  
     * @returns a function that can be called to "unplug" the source from Bus.
     */
    plug(input) {
        assertObservable(input);
        if (this.ended) {
            return;
        }
        var sub = { input: input, unsub: undefined };
        this.subscriptions.push(sub);
        if (typeof this.sink !== "undefined") {
            this.subscribeInput(sub);
        }
        return (() => this.unsubscribeInput(input));
    }
    /**
     Ends the stream. Sends an [End](end.html) event to all subscribers.
     After this call, there'll be no more events to the subscribers.
     Also, the [`push`](#push), [`error`](#error) and [`plug`](#plug) methods have no effect.
     */
    end() {
        this.ended = true;
        this.unsubAll();
        if (typeof this.sink === "function") {
            return this.sink(endEvent());
        }
    }
    /**
     * Pushes a new value to the stream.
     */
    push(value) {
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
    }
    /**
     * Pushes an error to this stream.
     */
    error(error) {
        if (typeof this.sink === "function") {
            return this.sink(new Error$1(error));
        }
    }
    /** @hidden */
    unsubAll() {
        var iterable = this.subscriptions;
        for (var i = 0, sub; i < iterable.length; i++) {
            sub = iterable[i];
            if (typeof sub.unsub === "function") {
                sub.unsub();
            }
        }
    }
    /** @hidden */
    subscribeAll(newSink) {
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
    }
    /** @hidden */
    guardedSink(input) {
        return (event) => {
            if (event.isEnd) {
                this.unsubscribeInput(input);
                return noMore;
            }
            else if (this.sink) {
                return this.sink(event);
            }
            else {
                return more;
            }
        };
    }
    /** @hidden */
    subscribeInput(subscription) {
        subscription.unsub = subscription.input.subscribeInternal(this.guardedSink(subscription.input));
        return subscription.unsub;
    }
    /** @hidden */
    unsubscribeInput(input) {
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
    }
}

/** @hidden */
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

/**
 * JQuery/Zepto integration support
 */
const $ = {
    /**
     Creates an EventStream from events on a
     jQuery or Zepto.js object. You can pass optional arguments to add a
     jQuery live selector and/or a function that processes the jQuery
     event and its parameters, if given, like this:
  
     ```js
     $("#my-div").asEventStream("click", ".more-specific-selector")
     $("#my-div").asEventStream("click", ".more-specific-selector", function(event, args) { return args[0] })
     $("#my-div").asEventStream("click", function(event, args) { return args[0] })
     ```
  
     Note: you need to install the `asEventStream` method on JQuery by calling
     [init()](#_.aseventstream) as in `Bacon.$.init($)`.
     */
    asEventStream(eventName, selector, eventTransformer) {
        if (_.isFunction(selector)) {
            eventTransformer = selector;
            selector = undefined;
        }
        return fromBinder((handler) => {
            this.on(eventName, selector, handler);
            return (() => this.off(eventName, selector, handler));
        }, eventTransformer).withDesc(new Desc(this.selector || this, "asEventStream", [eventName]));
    },
    /**
     * Installs the [asEventStream](#_.aseventstream) to the given jQuery/Zepto object (the `$` object).
     */
    init(jQuery) {
        jQuery.fn.asEventStream = $.asEventStream;
    }
};

/**
 *  Bacon.js version as string
 */
const version = '3.0.17';

export { $, Bus, CompositeUnsubscribe, Desc, End, Error$1 as Error, Event, EventStream, Initial, Next, Observable, Property, Value, _, combine, combineAsArray, combineTemplate, combineTwo, combineWith, concatAll, constant, fromArray, fromBinder, fromCallback, fromESObservable, fromEvent, fromEvent as fromEventTarget, fromNodeCallback, fromPoll, fromPromise, getScheduler, groupSimultaneous, hasValue, interval, isEnd, isError, isEvent, isInitial, isNext, later, mergeAll, more, never, noMore, nullSink, nullVoidSink, onValues, once, repeat, repeatedly, retry, sequentially, setScheduler, silence, spy, tryF as try, update, version, when, zipAsArray, zipWith };
