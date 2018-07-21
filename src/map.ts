import { Desc } from "./describe";
import Observable from "./observable"
import { Property } from "./observable";
import { Event } from "./event"
import { EventSink } from "./types"
import withLatestFrom from "./withlatestfrom"
import _ from "./_"

export function map<V, V2>(src: Observable<V>, f: ((V) => V2) | Property<V2> | V2): Observable<V2> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (a, b) => b)
  }
  return src.transform(mapT(f), new Desc(src, "map", [f]))
}

export function mapT<V, V2>(f: ((V) => V2) | V2) {
  let theF = _.toFunction(f)
  return (e: Event<V>, sink: EventSink<V2>) => {
    return sink(e.fmap(theF))
  }
}

export default map