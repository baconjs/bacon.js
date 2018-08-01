import { EventStream } from "./observable";
/**
 * Creates an EventStream from an
 [ES Observable](https://github.com/tc39/proposal-observable). Input can be any
 ES Observable implementation including RxJS and Kefir.
 */
export default function fromESObservable<V>(_observable: any): EventStream<V>;
