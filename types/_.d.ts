/** @hidden */
export declare function all<A>(xs: A[], f: (x: A) => boolean): boolean;
/** @hidden */
export declare function always<A>(x: A): () => A;
/** @hidden */
export declare function any<A>(xs: A[], f: (x: A) => boolean): boolean;
/** @hidden */
export declare function bind<F extends Function>(fn: F, me: any): F;
/** @hidden */
export declare function contains<A>(xs: A[], x: A): boolean;
/** @hidden */
export declare function each<A>(xs: any, f: (key: string, x: A) => any): void;
/** @hidden */
export declare function empty<A>(xs: A[]): boolean;
/** @hidden */
export declare function filter<A>(f: (a: A) => boolean, xs: A[]): A[];
/** @hidden */
export declare function flatMap<A, B>(f: (x: A) => B[], xs: A[]): B[];
/** @hidden */
export declare function flip<A, B, C>(f: (a: A, b: B) => C): ((b: B, a: A) => C);
/** @hidden */
export declare function fold<V, A>(xs: V[], seed: A, f: (acc: A, x: V) => A): A;
/** @hidden */
export declare function head<V>(xs: V[]): V;
/** @hidden */
export declare function id<A>(x: A): A;
/** @hidden */
declare function indexOfDefault<A>(xs: A[], x: A): number;
/** @hidden */
export declare const indexOf: typeof indexOfDefault;
/** @hidden */
export declare function indexWhere<A>(xs: A[], f: (x: A) => boolean): number;
/** @hidden */
export declare function isFunction(f: any): f is Function;
/** @hidden */
export declare function last<A>(xs: A[]): A;
/** @hidden */
export declare function map<A, B>(f: (a: A) => B, xs: A[]): B[];
/** @hidden */
export declare function negate<A>(f: (x: A) => boolean): (x: A) => boolean;
/** @hidden */
export declare function remove<V>(x: V, xs: V[]): V[] | undefined;
/** @hidden */
export declare function tail<V>(xs: V[]): V[];
/** @hidden */
export declare function toArray<A>(xs: A[] | A): A[];
/** @hidden */
export declare function toFunction<V, V2>(f: ((x: V) => V2) | V2): ((x: V) => V2);
/** @hidden */
export declare function toString(obj: any): string;
/** @hidden */
export declare function without<A>(x: A, xs: A[]): A[];
declare var _: {
    indexOf: typeof indexOfDefault;
    indexWhere: typeof indexWhere;
    head: typeof head;
    always: typeof always;
    negate: typeof negate;
    empty: typeof empty;
    tail: typeof tail;
    filter: typeof filter;
    map: typeof map;
    each: typeof each;
    toArray: typeof toArray;
    contains: typeof contains;
    id: typeof id;
    last: typeof last;
    all: typeof all;
    any: typeof any;
    without: typeof without;
    remove: typeof remove;
    fold: typeof fold;
    flatMap: typeof flatMap;
    bind: typeof bind;
    isFunction: typeof isFunction;
    toFunction: typeof toFunction;
    toString: typeof toString;
};
export default _;
