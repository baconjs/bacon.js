import { Event } from "./event";
import { EventStream } from "./observable";
export default function sequentially<V>(delay: number, values: (V | Event<V>)[]): EventStream<V>;
