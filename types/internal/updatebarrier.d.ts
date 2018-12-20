import { Event } from "../event";
import { Subscribe } from "../types";
interface Observable {
    id: number;
    internalDeps(): Observable[];
}
declare type Call = () => any;
declare type Sink<V> = (value: V) => any;
declare type EventSink<V> = Sink<Event<V>>;
declare function toString(): string;
declare function isInTransaction(): boolean;
declare function soonButNotYet(obs: Observable, f: Call): void;
declare function afterTransaction(obs: Observable, f: Call): void;
declare function whenDoneWith(obs: Observable, f: Call): any;
declare function inTransaction(event: Event<any> | undefined, context: any, f: Function, args: any[]): any;
declare function currentEventId(): number | undefined;
declare function wrappedSubscribe<V>(obs: Observable, subscribe: Subscribe<V>, sink: EventSink<V>): () => void;
declare function hasWaiters(): boolean;
declare const _default: {
    toString: typeof toString;
    whenDoneWith: typeof whenDoneWith;
    hasWaiters: typeof hasWaiters;
    inTransaction: typeof inTransaction;
    currentEventId: typeof currentEventId;
    wrappedSubscribe: typeof wrappedSubscribe;
    afterTransaction: typeof afterTransaction;
    soonButNotYet: typeof soonButNotYet;
    isInTransaction: typeof isInTransaction;
};
export default _default;
