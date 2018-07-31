import { EventStream } from "./observable";
import { Event } from "./event";
export default function fromArray<T>(values: (T | Event<T>)[]): EventStream<{}>;
