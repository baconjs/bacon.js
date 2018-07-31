import "./scan";
import "./filter";
import { Desc } from "./describe";
import { Observable, Property } from "./observable";

/** @hidden */
export function slidingWindow<V>(src: Observable<V>, maxValues: number, minValues: number = 0): Property<V[]> {
  return src.scan<V[]>([],
    (function (window: V[], value: V) {
      return window.concat([value]).slice(-maxValues);
    }))
    .filter((function (values: V[]) {
      return values.length >= minValues;
    })).withDesc(new Desc(src, "slidingWindow", [maxValues, minValues]));
}
