import { EventStream } from "./observable";
/** @hidden */
export default function tryF<In, Out>(f: (value: In) => Out): (value: In) => EventStream<Out>;
