import { Desc } from "./describe";
import { more } from "./reply";
import { Property } from "./observable";
import Observable from "./observable"
import { Event } from "./event"
import { EventSink } from "./types"
import withLatestFrom from "./withlatestfrom"
import _ from "./_"

export function filter<V>(f: ((V) => boolean) | boolean | Property<boolean>, src: Observable<V>): Observable<V> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (p, v) => [p, v])
      .filter(([v, p]) => p)
      .map(([v, p]) => v)
  }
  return src.transform(filterT(f), new Desc(src, "filter", [f]))
}

function filterT<V>(f_: ((V) => boolean) | boolean) {
  let f: (V) => boolean 
  if (typeof f_ == "boolean") {
    f = _.always(f_)
  } else if (typeof f_ != "function") {
    throw new Error("Not a function: " + f_)
  } else {
    f = f_
  }

  return (e:Event<V>, sink: EventSink<V>) => {
    if (e.filter(f)) {
      return sink(e);
    } else {
      return more;
    }
  }
}