import { Option } from "../optional";
import { EventSink, Subscribe, Unsub } from "../types";
/** @hidden */
export default function streamSubscribeToPropertySubscribe<V>(initValue: Option<V>, streamSubscribe: Subscribe<V>): (sink: EventSink<V>) => Unsub;
