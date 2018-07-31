import { mapT } from "./map";
import { takeT } from "./take";
import { Desc } from "./describe";
import Observable from "./observable";
import { composeT } from "./transform";

/** @hidden */
export function skipUntil<V>(src: Observable<V>, starter: Observable<any>): Observable<V> {
  var started = starter
    .transform(composeT(takeT(1), mapT<V, boolean>(true)))
    .toProperty()
    .startWith(false);
  return src.filter(started).withDesc(new Desc(src, "skipUntil", [starter]));
};

export default skipUntil
