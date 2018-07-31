import { EventStream } from "./observable";
import Observable from "./observable";
export default function repeat<V>(generator: (number: any) => (Observable<V> | null)): EventStream<V>;
