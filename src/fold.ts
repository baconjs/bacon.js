import "./filter";
import "./mapend";
import "./sample";
import "./scan";

import Observable from "./observable";
import { Desc } from "./describe";
import { Accumulator } from "./scan";
import { Property } from "./observable";

/** @hidden */
export default function fold<In, Out>(src: Observable<In>, seed: Out, f: Accumulator<In, Out>): Property<Out> {
  return <any>src.scan(seed, f)
    .last()
    .withDesc(new Desc(src, "fold", [seed, f]));
}

/** @hidden */
export function foldSeedless<InOut>(src: Observable<InOut>, f: Accumulator<InOut, InOut>): Property<InOut> {
  return <any>src.scan(f)
    .last()
    .withDesc(new Desc(src, "fold", [f]));
}