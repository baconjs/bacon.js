import { Desc } from "./describe";
import Observable from "./observable"
import { Property } from "./observable";
import { Event } from "./event"
import { EventSink } from "./types"
import { Reply } from "./reply";
import withLatestFrom from "./withlatestfrom"
import _ from "./_"

/** @hidden */
export function map<V, V2>(src: Observable<V>, f: ((value: V) => V2) | Property<V2> | V2): Observable<V2> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (a, b) => b)
  }
  return src.transform(mapT(f), new Desc(src, "map", [f]))
}

/** @hidden */
export function mapT<V, V2>(f: ((value: V) => V2) | V2): (e: Event<V>, sink: EventSink<V2>) => Reply {
  let theF = _.toFunction(f)
  return (e, sink) => {
    return sink(e.fmap(theF))
  }
}

export default map
