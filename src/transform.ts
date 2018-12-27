import { Desc } from "./describe";
import { EventSink } from "./types";
import { Reply } from "./reply";
import { allowSync, EventStream, Property } from "./observable";
import { Event } from "./event";

/** @hidden */
export function transformP<V, V2>(src: Property<V>, transformer: Transformer<V, V2>, desc? : Desc): Property<V2> {
  return new Property<V2>(
    new Desc(src, "transform", [transformer]),
    sink =>
      src.subscribeInternal(e =>
        transformer(e, sink)
      )
  ).withDesc(desc);
}

/** @hidden */
export function transformE<V, V2>(src: EventStream<V>, transformer: Transformer<V, V2>, desc?: Desc): EventStream<V2> {
  return new EventStream<V2>(
    new Desc(src, "transform", [transformer]),
    sink =>
      src.subscribeInternal(e =>
        transformer(e, sink)
      ),
    undefined,
    allowSync
  ).withDesc(desc)
}

/** @hidden */
export function composeT<V, V2, V3>(t1: Transformer<V, V2>, t2: Transformer<V2, V3>): Transformer<V, V3> {
  let finalSink: EventSink<V3> // mutation used to avoid closure creation while dispatching events
  const sink2 = (event: Event<V2>) => {
    return t2(event, finalSink)
  }
  return (event: Event<V>, sink: EventSink<V3>) => {
    finalSink = sink
    return t1(event, sink2)
  }
}

export type Transformer<V1, V2> = (event: Event<V1>, sink: EventSink<V2>) => Reply;
