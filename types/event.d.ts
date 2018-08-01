export declare abstract class Event<V> {
    id: number;
    isEvent: boolean;
    _isEvent: boolean;
    isEnd: boolean;
    isInitial: boolean;
    isNext: boolean;
    isError: boolean;
    hasValue: boolean;
    filter(f: (V: any) => boolean): boolean;
    inspect(): string;
    log(): any;
    toNext(): Event<V>;
    abstract fmap<V2>(f: (V: any) => V2): Event<V2>;
}
/** @hidden */
export declare abstract class Value<V> extends Event<V> {
    value: V;
    hasValue: boolean;
    constructor(value: V);
    fmap<V2>(f: (V: any) => V2): Value<V2>;
    filter(f: (V: any) => boolean): boolean;
    toString(): string;
    log(): any;
    abstract apply<V2>(value: V2): Value<V2>;
}
export declare class Next<V> extends Value<V> {
    constructor(value: V);
    apply<V2>(value: V2): Next<V2>;
    isNext: boolean;
    _isNext: boolean;
}
export declare class Initial<V> extends Value<V> {
    constructor(value: V);
    apply<V2>(value: V2): Initial<V2>;
    isInitial: boolean;
    _isInitial: boolean;
    toNext(): Next<V>;
}
/** @hidden */
declare abstract class NoValue<V> extends Event<V> {
    fmap<V2>(f: (V: any) => V2): NoValue<V2>;
    hasValue: boolean;
}
export declare class End<V> extends NoValue<V> {
    isEnd: boolean;
    toString(): string;
}
export declare class Error<V> extends NoValue<V> {
    error: any;
    constructor(error: any);
    isError: boolean;
    toString(): string;
}
/** @hidden */
export declare function initialEvent<V>(value: V): Initial<V>;
/** @hidden */
export declare function nextEvent<V>(value: V): Next<V>;
/** @hidden */
export declare function endEvent<V>(): End<V>;
/** @hidden */
export declare function toEvent<V>(x: V | Event<V>): Event<V>;
export default Event;
export declare function isEvent<V>(e: any): e is Event<V>;
export declare function isInitial<V>(e: any): e is Initial<V>;
export declare function isError<V>(e: Event<V>): e is Error<V>;
export declare function hasValue<V>(e: Event<V>): e is Value<V>;
export declare function isEnd<V>(e: Event<V>): e is End<V>;
