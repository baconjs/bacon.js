import Dispatcher from "./dispatcher";
import Observable from "../observable";
import { nop } from "../helpers";
import { Option } from "../optional";
import { Event, Value } from "../event";
import { EventSink, Subscribe } from "../types";
/** @hidden */
export default class PropertyDispatcher<V, O extends Observable<V>> extends Dispatcher<V, O> {
    current: Option<Value<V>>;
    currentValueRootId?: number;
    propertyEnded: boolean;
    constructor(property: O, subscribe: Subscribe<V>, handleEvent?: EventSink<V>);
    push(event: Event<V>): any;
    maybeSubSource(sink: EventSink<V>, reply: any): typeof nop;
    subscribe(sink: EventSink<V>): typeof nop;
    inspect(): string;
}
