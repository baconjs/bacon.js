import { EventTransformer } from "./frombinder";
import { EventStream } from "./observable";
export default function fromPromise<V>(promise: Promise<V>, abort: any, eventTransformer?: EventTransformer<V>): EventStream<V>;
