import { Desc } from "./describe";
import { EventSink } from "./types";
import { EventStream, Property } from "./observable";
import { Event } from "./event";
export declare function transformP<V, V2>(src: Property<V>, transformer: Transformer<V, V2>, desc?: Desc): Property<V2>;
export declare function transformE<V, V2>(src: EventStream<V>, transformer: Transformer<V, V2>, desc?: Desc): EventStream<V2>;
export declare function composeT<V, V2, V3>(t1: Transformer<V, V2>, t2: Transformer<V2, V3>): Transformer<V, V3>;
export interface Transformer<V1, V2> {
    (event: Event<V1>, sink: EventSink<V2>): any;
}
