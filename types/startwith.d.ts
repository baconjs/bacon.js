import { Property } from "./observable";
import { EventStream } from "./observable";
export declare function startWithE<V>(src: EventStream<V>, seed: V): EventStream<V>;
export declare function startWithP<V>(src: Property<V>, seed: V): Property<V>;
