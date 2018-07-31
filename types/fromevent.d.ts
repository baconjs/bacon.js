import { EventStream } from "./observable";
export default function fromEvent<V>(target: any, eventSource: any, eventTransformer: any): EventStream<V>;
