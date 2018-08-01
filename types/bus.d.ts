import { EventStream } from "./observable";
import Observable from "./observable";
import { EventSink } from "./types";
interface Subscription<V> {
    input: Observable<V>;
}
/**
 A pushable/pluggable stream

 Pro tip: you can also put Errors into streams created with the
 constructors above, by using an [`Bacon.Error`](error) object instead of a plain
 value.
 */
export default class Bus<V> extends EventStream<V> {
    sink?: EventSink<V>;
    pushing: boolean;
    pushQueue?: V[];
    ended: boolean;
    subscriptions: Subscription<V>[];
    constructor();
    unsubAll(): void;
    subscribeAll(newSink: EventSink<V>): () => void;
    guardedSink(input: Observable<V>): (event: any) => Reply | undefined;
    subscribeInput(subscription: any): any;
    unsubscribeInput(input: Observable<V>): void;
    plug(input: Observable<V>): (() => void) | undefined;
    end(): Reply | undefined;
    push(value: V): Reply | undefined;
    error(error: any): Reply | undefined;
}
export {};
