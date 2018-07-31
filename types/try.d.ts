import { EventStream } from "./observable";
export default function tryF<In, Out>(f: (In: any) => Out): (In: any) => EventStream<Out>;
