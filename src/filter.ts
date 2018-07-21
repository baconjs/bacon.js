import { Desc } from "./describe";
import { more } from "./reply";
import { Property } from "./observable";
import Observable from "./observable"
import { Event } from "./event"
import { EventSink } from "./types"
import withLatestFrom from "./withlatestfrom"
import _ from "./_"
import { composeT } from "./transform";
import { mapT } from "./map";

export function filter<V>(src: Observable<V>, f: ((V) => boolean) | boolean | Property<boolean>): Observable<V> {
  let desc = new Desc(src, "filter", [f]);
  if (f instanceof Property) {
    return withLatestFrom(src, f, (p, v) => [p, v])
      .transform(composeT(filterT(([v, p]) => p), mapT(([v, p]) => v)), desc)
  }
  return src.transform(filterT(f), desc)
}

export function filterT<V>(f_: ((V) => boolean) | boolean) {
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