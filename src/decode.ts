import "./combine";
import combineTemplate from "./combinetemplate";
import { Desc } from "./describe";
import { Observable, Property } from "./observable";

/** @hidden */
export function decode<T>(src: Observable<any>, cases: any): Property<T> {
  return src.combine(combineTemplate<any>(cases), (key, values) => values[key])
    .withDesc(new Desc(src, "decode", [cases]));
}

export default decode
