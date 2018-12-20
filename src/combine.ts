import "./map";
import constant from "./constant";
import { whenP } from "./when";
import { argumentsToObservables, argumentsToObservablesAndFunction } from "./internal/argumentstoobservables";
import { Desc } from "./describe";
import { isObservable } from "./helpers";
import { DefaultSource, Source } from "./internal/source";
import Observable from "./observable";
import { Property } from "./observable";

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
    return constant([]);
  }
}

/**
  Combines given *n* Properties,
  EventStreams and constant values using the given n-ary function `f(v1, v2 ...)`.

  To calculate the current sum of three numeric Properties, you can do

```js
function sum3(x,y,z) { return x + y + z }
Bacon.combineWith(sum3, p1, p2, p3)
```
*/
export function combineWith<Out>(f: (...args: any[]) => Out, ...streams: Observable<any>[]): Property<Out> {
  // TODO: untyped
  var [streams, f] = argumentsToObservablesAndFunction<Out>(arguments);
  var desc = new Desc("Bacon", "combineWith", [f, ...streams]);
  return combineAsArray(streams).map(function (values) {
    return f(...values);
  }).withDesc(desc);
};

/** @hidden */
export function combine<V, V2, R>(left: Observable<V>, right: Observable<V2>, f: (left: V, right: V2) => R): Property<R> {
  return whenP([[wrap(left), wrap(right)], f]).withDesc(new Desc(left, "combine", [right, f]));
};

function wrap<V>(obs: Observable<V>): DefaultSource<V> {
  return new DefaultSource<V>(obs, true)
}
