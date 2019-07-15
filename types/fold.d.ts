import "./filter";
import "./mapend";
import "./sample";
import "./scan";
import Observable from "./observable";
import { Accumulator } from "./scan";
import { Property } from "./observable";
/** @hidden */
export default function fold<In, Out>(src: Observable<In>, seed: Out, f: Accumulator<In, Out>): Property<Out>;
/** @hidden */
export declare function foldSeedless<InOut>(src: Observable<InOut>, f: Accumulator<InOut, InOut>): Property<InOut>;
