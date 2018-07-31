import { EventStream } from "./observable";
export default function repeatedly<V>(delay: number, values: V[]): EventStream<V>;
