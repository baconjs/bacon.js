import once from "./once";
import { Property } from "./observable";;
import { EventStream } from "./observable";
import { Desc } from "./describe";

export function startWithE<V>(src: EventStream<V>, seed: V): EventStream<V> {
  return once(seed).concat(src).withDesc(new Desc(src, "startWith", [seed]));
}

export function startWithP<V>(src: Property<V>, seed: V): Property<V> {
  return src.scan(seed, (prev, next) => next).withDesc(new Desc(src, "startWith", [seed]));
}