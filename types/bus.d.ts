import { EventStream } from "./observable";
import Observable from "./observable";
import { EventSink } from "./types";
interface Subscription<V> {
    input: Observable<V>;
}
export default class Bus<V> extends EventStream<V> {
    sink?: EventSink<V>;
    pushing: boolean;
    pushQueue?: V[];
    ended: boolean;
    subscriptions: Subscription<V>[];
    constructor();
    unsubAll(): void;
    subscribeAll(newSink: EventSink<V>): () => void;
    guardedSink(input: Observable<V>): (event: any) => any;
    subscribeInput(subscription: any): any;
    unsubscribeInput(input: Observable<V>): void;
    plug(input: Observable<V>): (() => void) | undefined;
    end(): any;
    push(value: V): any;
    error(error: any): any;
}
export {};
