import { Event } from "./event"
import { EventStream } from "./observable";

export type Sink<V> = (V) => any
export type EventSink<V> = Sink<Event<V>>
export type VoidSink = () => any
export type Unsub = () => void
export interface Subscribe<T> {
  (arg: EventSink<T>): any;
}
/** @hidden */
export interface EventStreamDelay<V> {
  (stream: EventStream<V>): EventStream<V>
}