import Observable, { Property } from "./observable";
export declare type Differ<V, V2> = (a: V, b: V) => V2;
/** @hidden */
export declare function diff<V, V2>(src: Observable<V>, start: V, f: Differ<V, V2>): Property<V2>;
