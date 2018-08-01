import { EventStream } from "./observable";
/** @hidden */
export default function tryF<In, Out>(f: (In: any) => Out): (In: any) => EventStream<Out>;
