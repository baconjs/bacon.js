import Observable, { Property } from "./observable";
import { Function2 } from "./types";
export declare type Differ<V, V2> = Function2<V, V, V2>;
/** @hidden */
export declare function diff<V, V2>(src: Observable<V>, start: V, f: Differ<V, V2>): Property<V2>;
