import { Event } from "./event"
import EventStream from "./eventstream";

export type Sink<V> = (V) => any
export type EventSink<V> = Sink<Event<V>>
export type VoidSink = () => any
export type Unsub = () => void
export interface Subscribe<T> {
  (arg: EventSink<T>): any;
}
export interface Transformer<V1, V2> {
  (event: Event<V1>, sink: EventSink<V2>): any;
}

export interface EventStreamDelay<V> {
  (stream: EventStream<V>): EventStream<V>
}