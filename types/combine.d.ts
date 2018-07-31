import "./map";
import Observable from "./observable";
import { Property } from "./observable";
export declare function combineAsArray<V>(...streams: (Observable<V> | Observable<V>[])[]): Property<any[]>;
export declare function combineWith(): Property<any>;
export declare function combine<V, V2, R>(left: Observable<V>, right: Observable<V2>, f: (V: any, V2: any) => R): Property<R>;
