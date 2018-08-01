import { Property } from "./observable";
import { EventStream } from "./observable";
/** @hidden */
export declare function startWithE<V>(src: EventStream<V>, seed: V): EventStream<V>;
/** @hidden */
export declare function startWithP<V>(src: Property<V>, seed: V): Property<V>;
