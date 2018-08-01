/** @hidden */
interface Option<V> {
    getOrElse(arg: V): V;
    get(): V;
    filter(f: (V: any) => boolean): Option<V>;
    map<V2>(f: (V: any) => V2): Option<V2>;
    forEach(f: (V: any) => any): void;
    isDefined: boolean;
    toArray(): V[];
    inspect(): string;
    toString(): string;
}
/** @hidden */
declare class Some<V> implements Option<V> {
    value: V;
    constructor(value: V);
    _isSome: boolean;
    getOrElse(arg: V): V;
    get(): V;
    filter(f: (V: any) => boolean): Option<V>;
    map<V2>(f: (V: any) => V2): Option<V2>;
    forEach(f: (V: any) => any): void;
    isDefined: boolean;
    toArray(): V[];
    inspect(): string;
    toString(): string;
}
/** @hidden */
declare const None: {
    _isNone: boolean;
    getOrElse<V>(value: V): V;
    get(): never;
    filter(): any;
    map(): any;
    forEach(): void;
    isDefined: boolean;
    toArray(): never[];
    inspect(): string;
    toString(): string;
};
declare function none<T>(): Option<T>;
declare function toOption<V>(v: V | Option<V>): Option<V>;
export { Option, Some, None, none, toOption };
