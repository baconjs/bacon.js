import { Observable, Property } from "./observable";
/** @hidden */
export declare function flatScan<In, Out>(src: Observable<In>, seed: Out, f: (acc: Out, value: In) => Observable<Out>): Property<Out>;
