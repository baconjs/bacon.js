import { EventStream } from "./observable";
/**
 * A helper for creating an EventStream of a single value, or a single Error event in case the given
 * function throws an exception.
 */
export default function tryF<In, Out>(f: (value: In) => Out): (value: In) => EventStream<Out>;
