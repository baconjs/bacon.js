import Observable, { Property } from "./observable";
import "./sample";
import "./filter";
import { endEvent } from "./event";
import { noMore } from "./reply";
import { Desc } from "./describe";
import withLatestFrom from "./withlatestfrom";
import { composeT, Transformer } from "./transform";
import { mapT } from "./map";

export function takeWhile<V>(src: Observable<V>, f: ((V) => boolean) | Property<boolean>): Observable<V> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (p, v) => [p, v])
      .transform(composeT(takeWhileT(([v, p]) => p), mapT(([v, p]) => v)))
  }

  return src.transform(takeWhileT(f), new Desc(src, "takeWhile", [f]))
}

function takeWhileT<V>(f: ((V) => boolean)): Transformer<V, V> {
  return (event, sink) => {
    if (event.filter(f)) {
      return sink(event);
    } else {
      sink(endEvent());
      return noMore;
    }
  }
}