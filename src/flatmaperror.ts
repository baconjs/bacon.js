import "./maperror";
import "./flatmap";
import Observable from "./observable";
import { Error, Event } from "./event";
import { Desc } from "./describe";
import flatMap_ from "./flatmap_"

/** @hidden */
export default function flatMapError<V>(src: Observable<V>, f: (error: any) => Observable<V>): Observable<V> {
  return flatMap_(
    (x: Event<V>) => {
      if (x instanceof Error) {
        let error: any = x.error;
        return f(error);
      } else {
        return x;
      }
    },
    src,
    {
      mapError: true,
      desc: new Desc(src, "flatMapError", [f])
    }
  )
}
