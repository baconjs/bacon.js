import { EventStream } from "./observable";
import Observable from "./observable";
import { EventSink, Unsub } from "./types";
import { Reply } from "./reply";
interface Subscription<V> {
    input: Observable<V>;
    unsub: Unsub | undefined;
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
    plug<V2 extends V>(input: Observable<V2>): (() => void) | undefined;
    /**
     Ends the stream. Sends an [End](end.html) event to all subscribers.
     After this call, there'll be no more events to the subscribers.
     Also, the [`push`](#push), [`error`](#error) and [`plug`](#plug) methods have no effect.
     */
    end(): Reply;
    /**
     * Pushes a new value to the stream.
     */
    push(value: V): Reply;
    /**
     * Pushes an error to this stream.
     */
    error(error: any): Reply;
    /** @hidden */
    unsubAll(): void;
    /** @hidden */
    subscribeAll(newSink: EventSink<V>): () => void;
    /** @hidden */
    guardedSink(input: Observable<V>): EventSink<V>;
    /** @hidden */
    subscribeInput(subscription: Subscription<V>): Unsub;
    /** @hidden */
    unsubscribeInput(input: Observable<any>): void;
}
export {};
