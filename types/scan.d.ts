import Observable from "./observable";
import { Property } from "./observable";
export interface Accumulator<In, Out> {
    (acc: Out, next: In): Out;
}
export default function scan<In, Out>(src: Observable<In>, seed: Out, f: Accumulator<In, Out>): Property<Out>;
