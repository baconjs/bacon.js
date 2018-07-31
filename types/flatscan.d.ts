import { Observable, Property } from "./observable";
export declare function flatScan<In, Out>(src: Observable<In>, seed: Out, f: (Out: any, In: any) => Observable<Out>): Property<Out>;
