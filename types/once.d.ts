import { EventStream } from "./observable";
import { Event } from "./event";
/**
 Creates an EventStream that delivers the given
 single value for the first subscriber. The stream will end immediately
 after this value. You can also send an [`Bacon.Error`](#bacon-error) event instead of a
 value: `Bacon.once(new Bacon.Error("fail"))`.

 @param   value   the value or event to emit
 @typeparam V Type of stream elements
 */
export default function once<V>(value: V | Event<V>): EventStream<V>;
