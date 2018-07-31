import "./combine";
import combineTemplate from "./combinetemplate";
import { Desc } from "./describe";
import { Observable, Property } from "./observable";

/** @hidden */
export function decode(src: Observable<any>, cases): Property<any> {
  return src.combine(combineTemplate(cases), (key, values) => values[key])
    .withDesc(new Desc(src, "decode", [cases]));
}

export default decode