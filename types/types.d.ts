import { Event } from "./event";
import { EventStream } from "./observable";
import { Reply } from "./reply";
export declare type Sink<V> = (value: V) => Reply;
export declare type EventSink<V> = (event: Event<V>) => Reply;
export declare type VoidSink = () => Reply;
/** an "unsubscribe" function returned by [subscribe](classes/Observable.html#subscribe) et al. You can cancel your subscription by calling this function.
 */
export declare type Unsub = () => void;
/** @hidden */
export declare const nullSink: Sink<any>;
/** @hidden */
export declare const nullVoidSink: VoidSink;
export declare type Subscribe<T> = (arg: EventSink<T>) => any;
/** @hidden */
export declare type EventStreamDelay<V> = (stream: EventStream<V>) => EventStream<V>;
export declare type Function0<R> = () => R;
export declare type Function1<T1, R> = (t1: T1) => R;
export declare type Function2<T1, T2, R> = (t1: T1, t2: T2) => R;
