import { Option } from "../optional";
import { Event } from "../event";
import { Subscribe, Unsub } from "../types";
/** @hidden */
export default function streamSubscribeToPropertySubscribe<V>(initValue: Option<V>, streamSubscribe: Subscribe<V>): (sink: import("../../../../../../Users/juha/code/bacon.js/src/types").Sink<Event<V>>) => Unsub;
