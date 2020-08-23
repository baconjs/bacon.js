import "./map";
import constant from "./constant";
import { whenP } from "./when";
import { argumentsToObservables, argumentsToObservablesAndFunction } from "./internal/argumentstoobservables";
import { Desc } from "./describe";
import { isObservable } from "./helpers";
import { DefaultSource, Source } from "./internal/source";
import Observable from "./observable";
import { Property } from "./observable";
import { Function0, Function1, Function2, Function3, Function4, Function5, Function6 } from "./types";

/**
 Combines Properties, EventStreams and constant values so that the result Property will have an array of the latest
 values from all sources as its value. The inputs may contain both Properties and EventStreams.


 ```js
 property = Bacon.constant(1)
 stream = Bacon.once(2)
 constant = 3
 Bacon.combineAsArray(property, stream, constant)
 # produces the value [1,2,3]
 ```

 * @param streams streams and properties to combine
 */
export function combineAsArray<V>(...streams: (Observable<V> | Observable<V>[])[]): Property<V[]> {
  streams = argumentsToObservables(streams)
  if (streams.length) {
    var sources: Source<V, V>[] = [];
    for (var i = 0; i < streams.length; i++) {
      let stream: Observable<V> = <any>(isObservable(streams[i])
        ? streams[i]
        : constant(streams[i]))
      sources.push(wrap(stream));
    }
    return whenP<V[]>([sources, (...xs: V[]) => xs]).withDesc(new Desc("Bacon", "combineAsArray", streams));
  } else {
    return constant<V[]>([]);
  }
}

/**
  Combines given *n* Properties and
  EventStreams using the given n-ary function `f(v1, v2 ...)`.

  To calculate the current sum of three numeric Properties, you can do

```js
function sum3(x,y,z) { return x + y + z }
Bacon.combineWith(sum3, p1, p2, p3)
```
*/
export function combineWith<R>(fn: Function0<R>): Property<R>
export function combineWith<V, R>(a: Observable<V>, fn: Function1<V, R>): Property<R>
export function combineWith<V, V2, R>(a: Observable<V>, b: Observable<V2>, fn: Function2<V, V2, R>): Property<R>
export function combineWith<V, V2, V3, R>(a: Observable<V>, b: Observable<V2>, c: Observable<V3>, fn: Function3<V, V2, V3, R>): Property<R>
export function combineWith<V, V2, V3, V4, R>(a: Observable<V>, b: Observable<V2>, c: Observable<V3>, d: Observable<V4>, fn: Function4<V, V2, V3, V4, R>): Property<R>
export function combineWith<V, V2, V3, V4, V5, R>(a: Observable<V>, b: Observable<V2>, c: Observable<V3>, d: Observable<V4>, e: Observable<V5>, fn: Function5<V, V2, V3, V4, V5, R>): Property<R>
export function combineWith<V, V2, V3, V4, V5, V6, R>(a: Observable<V>, b: Observable<V2>, c: Observable<V3>, d: Observable<V4>, e: Observable<V5>, f: Observable<V6>, fn: Function6<V, V2, V3, V4, V5, V6, R>): Property<R>
export function combineWith<R>(observables: Observable<any>[], fn: Function): Property<R>

export function combineWith<V, R>(fn: Function1<V, R>, a: Observable<V>): Property<R>
export function combineWith<V, V2, R>(fn: Function2<V, V2, R>, a: Observable<V>, b: Observable<V2>): Property<R>
export function combineWith<V, V2, V3, R>(fn: Function3<V, V2, V3, R>, a: Observable<V>, b: Observable<V2>, c: Observable<V3>): Property<R>
export function combineWith<V, V2, V3, V4, R>(fn: Function4<V, V2, V3, V4, R>, a: Observable<V>, b: Observable<V2>, c: Observable<V3>, d: Observable<V4>): Property<R>
export function combineWith<V, V2, V3, V4, V5, R>(fn: Function5<V, V2, V3, V4, V5, R>, a: Observable<V>, b: Observable<V2>, c: Observable<V3>, d: Observable<V4>, e: Observable<V5>): Property<R>
export function combineWith<V, V2, V3, V4, V5, V6, R>(fn: Function6<V, V2, V3, V4, V5, V6, R>, a: Observable<V>, b: Observable<V2>, c: Observable<V3>, d: Observable<V4>, e: Observable<V5>, f: Observable<V6>): Property<R>
export function combineWith<R>(fn: Function, observables: Observable<any>[]): Property<R>
export function combineWith<Out>(...args: any[]): Property<Out> {
  // TODO: untyped
  var [streams, f] = argumentsToObservablesAndFunction<Out>(arguments);
  var desc = new Desc("Bacon", "combineWith", [f, ...streams]);
  return combineAsArray(streams).map(function (values) {
    return f(...values);
  }).withDesc(desc);
};

export const combine = combineWith

/** @hidden */
export function combineTwo<V, V2, R>(left: Observable<V>, right: Observable<V2>, f: Function2<V, V2, R>): Property<R> {
  return whenP([[wrap(left), wrap(right)], f]).withDesc(new Desc(left, "combine", [right, f]));
};

function wrap<V>(obs: Observable<V>): DefaultSource<V> {
  return new DefaultSource<V>(obs, true)
}
