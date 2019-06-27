import { Observable, Property } from "./observable";
import { Function2 } from "./types";
/** @hidden */
export declare function flatScanSeedless<V>(src: Observable<V>, f: Function2<V, V, Observable<V> | V>): Property<V>;
/** @hidden */
export declare function flatScan<In, Out>(src: Observable<In>, seed: Out, f: Function2<Out, In, Observable<Out> | Out>): Property<Out>;
