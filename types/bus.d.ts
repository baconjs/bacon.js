import { EventStream } from "./observable";
import Observable from "./observable";
import { EventSink } from "./types";
interface Subscription<V> {
    input: Observable<V>;
}
/**
 An [`EventStream`](eventstream.html) that allows you to [`push`](#push) values into the stream.

 It also allows plugging other streams into the Bus, as inputs. The Bus practically
 merges all plugged-in streams and the values pushed using the [`push`](#push)
 method.
 */
export default class Bus<V> extends EventStream<V> {
    /** @hidden */
    sink?: EventSink<V>;
    /** @hidden */
    pushing: boolean;
    /** @hidden */
    pushQueue?: V[];
    /** @hidden */
    ended: boolean;
    /** @hidden */
    subscriptions: Subscription<V>[];
    constructor();
    /**
     Plugs the given stream as an input to the Bus. All events from
     the given stream will be delivered to the subscribers of the Bus.
     Returns a function that can be used to unplug the same stream.
  
     The plug method practically allows you to merge in other streams after
     the creation of the Bus.
  
     * @returns a function that can be called to "unplug" the source from Bus.
     */
    plug(input: Observable<V>): (() => void) | undefined;
    /**
     Ends the stream. Sends an [End](end.html) event to all subscribers.
     After this call, there'll be no more events to the subscribers.
     Also, the [`push`](#push), [`error`](#error) and [`plug`](#plug) methods have no effect.
     */
    end(): Reply | undefined;
    /**
     * Pushes a new value to the stream.
     */
    push(value: V): Reply | undefined;
    /**
     * Pushes an error to this stream.
     */
    error(error: any): Reply | undefined;
    /** @hidden */
    unsubAll(): void;
    /** @hidden */
    subscribeAll(newSink: EventSink<V>): () => void;
    /** @hidden */
    guardedSink(input: Observable<V>): (event: any) => Reply | undefined;
    /** @hidden */
    subscribeInput(subscription: any): any;
    /** @hidden */
    unsubscribeInput(input: Observable<V>): void;
}
export {};
