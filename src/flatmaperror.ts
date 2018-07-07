import "./maperror";
import "./flatmap";
import Observable from "./observable";
import { Error } from "./event";
import { Desc } from "./describe";
import flatMap_ from "./flatmap_"

export default function flatMapError<V>(src: Observable<V>, f: (any) => Observable<V>): Observable<V> {
  return flatMap_(
    (x) => {
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