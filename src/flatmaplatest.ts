import flatMap from "./flatmap";
import "./takeuntil";

import { makeObservable, Spawner } from "./flatmap_";
import Observable from "./observable";
import { Desc } from "./describe";
import { allowSync, isProperty } from "./observable";
import _ from "./_"

export default function flatMapLatest<V, V2>(src: Observable<V>, f_: Spawner<V, V2>): Observable<V2> {
  let f = _.toFunction(f_)
  var stream = isProperty(src) ? src.toEventStream(allowSync) : src;
  let flatMapped = flatMap(stream, (value: V) => makeObservable(f(value)).takeUntil(stream))
  if (isProperty(src)) flatMapped = flatMapped.toProperty()
  return flatMapped.withDesc(new Desc(src, "flatMapLatest", [f]));
}