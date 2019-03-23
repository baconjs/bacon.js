import { Observable, Property } from "./observable";
import { Function2 } from "./types";
/** @hidden */
export declare function flatScan<In, Out>(src: Observable<In>, seed: Out, f: Function2<Out, In, Observable<Out> | Out>): Property<Out>;
