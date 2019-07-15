import Observable from "./observable";
import { Property } from "./observable";
export declare type Accumulator<In, Out> = (acc: Out, value: In) => Out;
/** @hidden */
export default function scan<In, Out>(src: Observable<In>, seed: Out, f: Accumulator<In, Out>): Property<Out>;
/** @hidden */
export declare function scanSeedless<V>(src: Observable<V>, f: Accumulator<V, V>): Property<V>;
