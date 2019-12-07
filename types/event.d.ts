/**
 * Base class for all events passed through [EventStreams](eventstream.html) and [Properties](property.html).
 */
export declare abstract class Event<V> {
    id: number;
    /** @hidden */
    isEvent: boolean;
    /** @hidden */
    _isEvent: boolean;
    isEnd: boolean;
    isInitial: boolean;
    isNext: boolean;
    isError: boolean;
    hasValue: boolean;
    /** @hidden */
    filter(f: (value: V) => boolean): boolean;
    /** @hidden */
    inspect(): string;
    /** @hidden */
    log(): any;
    /** @hidden */
    toNext(): Event<V>;
    /** @hidden */
    abstract fmap<V2>(f: (value: V) => V2): Event<V2>;
}
/**
 *  Base class for all [Events](event.html) carrying a value.
 *
 *  Can be distinguished from other events using [hasValue](../globals.html#hasvalue)
 **/
export declare abstract class Value<V> extends Event<V> {
    value: V;
    hasValue: boolean;
    constructor(value: V);
    /** @hidden */
    fmap<V2>(f: (value: V) => V2): Value<V2>;
    /** @hidden */
    filter(f: (value: V) => boolean): boolean;
    /** @hidden */
    toString(): string;
    /** @hidden */
    log(): any;
    /** @hidden */
    abstract apply<V2>(value: V2): Value<V2>;
}
/**
 *  Indicates a new value in an [EventStream](eventstream.html) or a [Property](property.html).
 *
 *  Can be distinguished from other events using [isNext](../globals.html#isnext)
 */
export declare class Next<V> extends Value<V> {
    constructor(value: V);
    /** @hidden */
    apply<V2>(value: V2): Next<V2>;
    isNext: boolean;
    /** @hidden */
    _isNext: boolean;
}
/**
 * An event carrying the initial value of a [Property](classes/property.html). This event can be emitted by a property
 * immediately when subscribing to it.
 *
 * Can be distinguished from other events using [isInitial](../globals.html#isinitial)
 */
export declare class Initial<V> extends Value<V> {
    constructor(value: V);
    /** @hidden */
    apply<V2>(value: V2): Initial<V2>;
    isInitial: boolean;
    /** @hidden */
    _isInitial: boolean;
    /** @hidden */
    toNext(): Next<V>;
}
/**
 * Base class for events not carrying a value.
 */
export declare abstract class NoValue extends Event<any> {
    /** @hidden */
    fmap<V2>(f: Function): NoValue;
    hasValue: boolean;
}
/**
 * An event that indicates the end of an [EventStream](classes/eventstream.html) or a [Property](classes/property.html).
 * No more events can be emitted after this one.
 *
 * Can be distinguished from other events using [isEnd](../globals.html#isend)
 */
export declare class End extends NoValue {
    isEnd: boolean;
    /** @hidden */
    toString(): string;
}
/**
 *  An event carrying an error. You can use [onError](observable.html#onerror) to subscribe to errors.
 */
export declare class Error extends NoValue {
    /**
     * The actual error object carried by this event
     */
    error: any;
    constructor(error: any);
    isError: boolean;
    /** @hidden */
    toString(): string;
}
/** @hidden */
export declare function initialEvent<V>(value: V): Initial<V>;
/** @hidden */
export declare function nextEvent<V>(value: V): Next<V>;
/** @hidden */
export declare function endEvent(): End;
/** @hidden */
export declare function toEvent<V>(x: V | Event<V>): Event<V>;
export default Event;
/**
 * Returns true if the given object is an [Event](classes/event.html).
 */
export declare function isEvent<V>(e: any): e is Event<V>;
/**
 * Returns true if the given event is an [Initial](classes/initial.html) value of a [Property](classes/property.html).
 */
export declare function isInitial<V>(e: Event<V>): e is Initial<V>;
/**
 * Returns true if the given event is an [Error](classes/error.html) event of an [Observable](classes/observable.html).
 */
export declare function isError<V>(e: Event<V>): e is Error;
/**
 * Returns true if the given event is a [Value](classes/value.html), i.e. a [Next](classes/next.html) or
 * an [Initial](classes/error.html) value of an [Observable](classes/observable.html).
 */
export declare function hasValue<V>(e: Event<V>): e is Value<V>;
/**
 * Returns true if the given event is an [End](classes/end.html)
 */
export declare function isEnd<V>(e: Event<V>): e is End;
/**
 * Returns true if the given event is a [Next](classes/next.html)
 */
export declare function isNext<V>(e: Event<V>): e is Next<V>;
