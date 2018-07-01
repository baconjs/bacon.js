import { Desc } from "./describe";
import Observable from "./observable"
import Property from "./property"
import { Event } from "./event"
import { EventSink } from "./types"
import withLatestFrom from "./withlatestfrom"

export function map<V, V2>(f: ((V) => V2) | Property<V2> | V2, src: Observable<V>): Observable<V2> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (a, b) => b)
  }
  return src.transform(mapT(toFunc(f)), new Desc(src, "map", [f]))
}

function toFunc<V, V2>(f: ((V) => V2) | V2): ((V) => V2) {
  if (typeof f == "function") {
    return f
  }
  return x => f
}

function mapT<V, V2>(f: ((V) => V2)) {
  return (e: Event<V>, sink: EventSink<V2>) => {
    return sink(e.fmap(f))
  }
}

export default map