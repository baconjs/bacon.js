import { EventStream } from "./observable";
export default function interval<V>(delay: any, value: V): EventStream<V>;
