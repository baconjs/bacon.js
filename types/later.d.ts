import "./scheduler";
import { EventStream } from "./observable";
export default function later<V>(delay: number, value: V): EventStream<V>;
