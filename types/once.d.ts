import { EventStream } from "./observable";
import { Event } from "./event";
export default function once<V>(value: V | Event<V>): EventStream<V>;
