import { Event } from "./event";
import { EventStream } from "./observable";
import { Reply } from "./reply";
export declare type Sink<V> = (V: any) => Reply;
export declare type EventSink<V> = Sink<Event<V>>;
export declare type VoidSink = () => Reply;
export declare type Unsub = () => void;
/** @hidden */
export declare const nullSink: Sink<any>;
/** @hidden */
export declare const nullVoidSink: VoidSink;
export interface Subscribe<T> {
    (arg: EventSink<T>): any;
}
/** @hidden */
export interface EventStreamDelay<V> {
    (stream: EventStream<V>): EventStream<V>;
}
