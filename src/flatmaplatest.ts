import flatMap from "./flatmap";
import "./takeuntil";

import { makeObservable, SpawnerOrObservable } from "./flatmap_";
import Observable, { EventStream } from "./observable";
import { Desc } from "./describe";
import { allowSync, isProperty } from "./observable";
import _ from "./_"

/** @hidden */
export default function flatMapLatest<V, V2>(src: Observable<V>, f_: SpawnerOrObservable<V, V2>): Observable<V2> {
  let f = _.toFunction(f_)
  var stream: EventStream<V> = isProperty<V>(src) ? src.toEventStream(allowSync) : src as EventStream<V>
  let flatMapped = flatMap(stream, (value: V) => makeObservable(f(value)).takeUntil(stream))
  if (isProperty(src)) flatMapped = flatMapped.toProperty()
  return flatMapped.withDesc(new Desc(src, "flatMapLatest", [f]));
}
