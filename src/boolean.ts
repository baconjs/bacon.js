import "./combine";
import "./map";
import Observable from "./observable";
import Property, { isProperty } from "./property";
import { Desc } from "./describe";
import constant from "./constant";

export function not(src: Observable<any>): Observable<boolean> {
  return src.map(x => !x).withDesc(new Desc(src, "not", []))
}

export function and(left: Property<any>, right: Property<any>): Property<boolean> {
  return left.combine(toProperty(right), (x, y) => x && y).withDesc(new Desc(left, "and", [right]))
}

export function or(left: Property<any>, right: Property<any>): Property<boolean> {
  return left.combine(toProperty(right), (x, y) => x || y).withDesc(new Desc(left, "or", [right]))
}

function toProperty<V>(x: V | Property<V>) {
  if (isProperty(x)) {
    return x
  }
  return constant(x)
}