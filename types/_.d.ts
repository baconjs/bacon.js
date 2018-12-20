/** @hidden */
declare function indexOfDefault<A>(xs: A[], x: A): number;
/** @hidden */
export declare const indexOf: typeof indexOfDefault;
/** @hidden */
export declare function id<A>(x: A): A;
declare function filter<A>(f: (a: A) => boolean, xs: A[]): A[];
/** @hidden */
export declare function flip<A, B, C>(f: (a: A, b: B) => C): ((b: B, a: A) => C);
/** @hidden */
export declare function fold<V, A>(xs: V[], seed: A, f: (acc: A, x: V) => A): A;
/** @hidden */
export declare function head<V>(xs: V[]): V;
/** @hidden */
export declare function isFunction(f: any): f is Function;
/** @hidden */
export declare function map<A, B>(f: (a: A) => B, xs: A[]): B[];
/** @hidden */
export declare function tail<V>(xs: V[]): V[];
/** @hidden */
export declare function toString(obj: any): string;
declare var _: {
    indexOf: typeof indexOfDefault;
    indexWhere<A>(xs: A[], f: (x: A) => boolean): number;
    head: typeof head;
    always<A>(x: A): () => A;
    negate<A>(f: (x: A) => boolean): (x: A) => boolean;
    empty<A>(xs: A[]): boolean;
    tail: typeof tail;
    filter: typeof filter;
    map: typeof map;
    each<A>(xs: any, f: (key: string, x: A) => any): void;
    toArray<A>(xs: A | A[]): A[];
    contains<A>(xs: A[], x: A): boolean;
    id: typeof id;
    last<A>(xs: A[]): A;
    all<A>(xs: A[], f: (x: A) => boolean): boolean;
    any<A>(xs: A[], f: (x: A) => boolean): boolean;
    without<A>(x: A, xs: A[]): A[];
    remove<V>(x: V, xs: V[]): V[] | undefined;
    fold: typeof fold;
    flatMap<A, B>(f: (x: A) => B[], xs: A[]): B[];
    bind<F extends Function>(fn: F, me: any): F;
    isFunction: typeof isFunction;
    toFunction<V, V2>(f: V2 | ((x: V) => V2)): (x: V) => V2;
    toString: typeof toString;
};
export default _;
