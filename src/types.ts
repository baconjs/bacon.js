import { Event } from "./event"
import { EventStream } from "./observable";
import { more, Reply } from "./reply";

export type Sink<V> = (V) => Reply
export type EventSink<V> = Sink<Event<V>>
export type VoidSink = () => Reply
export type Unsub = () => void
/** @hidden */
export const nullSink: Sink<any> = () => more
/** @hidden */
export const nullVoidSink: VoidSink = () => more
export interface Subscribe<T> {
  (arg: EventSink<T>): any;
}
/** @hidden */
export interface EventStreamDelay<V> {
  (stream: EventStream<V>): EventStream<V>
}