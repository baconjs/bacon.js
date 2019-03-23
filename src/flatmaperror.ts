import "./maperror";
import "./flatmap";
import Observable from "./observable";
import { Error, Event } from "./event";
import { Desc } from "./describe";
import flatMap_, { EventOrValue } from "./flatmap_"

/** @hidden */
export default function flatMapError<V, V2>(src: Observable<V>, f: (error: any) => Observable<V2> | EventOrValue<V2>): Observable<V | V2> {
  return flatMap_<V, V | V2>(
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
