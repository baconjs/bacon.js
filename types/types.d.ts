import { Event } from "./event";
import { EventStream } from "./observable";
export declare type Sink<V> = (V: any) => any;
export declare type EventSink<V> = Sink<Event<V>>;
export declare type VoidSink = () => any;
export declare type Unsub = () => void;
export interface Subscribe<T> {
    (arg: EventSink<T>): any;
}
export interface EventStreamDelay<V> {
    (stream: EventStream<V>): EventStream<V>;
}
