import { Event } from './event';
import { EventStream } from "./observable";
import { Sink, Unsub } from "./types";
export declare type FlexibleSink<V> = Sink<EventLike<V>>;
export declare type EventLike<V> = V | Event<V> | Event<V>[];
export interface Binder<V> {
    (sink: FlexibleSink<V>): Unsub;
}
export interface EventTransformer<V> {
    (...args: any[]): EventLike<V>;
}
export default function fromBinder<V>(binder: Binder<V>, eventTransformer?: EventTransformer<V>): EventStream<V>;
