import { argumentsToObservables, argumentsToObservablesAndFunction } from "./internal/argumentstoobservables";
import "./sample";
import Observable, { EventStream } from "./observable";
import _ from "./_";
import { Desc } from "./describe";
import when from "./when";

/**
 Zips the array of EventStreams / Properties in to a new
 EventStream that will have an array of values from each source as
 its value. Zipping means that events from each source are combined
 pairwise so that the 1st event from each source is published first, then
 the 2nd event from each. The results will be published as soon as there
 is a value from each source.

 Be careful not to have too much "drift" between streams. If one stream
 produces many more values than some other excessive buffering will
 occur inside the zipped observable.

 Example:

 ```js
 x = Bacon.fromArray([1,2,3])
 y = Bacon.fromArray([10, 20, 30])
 z = Bacon.fromArray([100, 200, 300])
 Bacon.zipAsArray(x, y, z)

 # produces values [1, 10, 100], [2, 20, 200] and [3, 30, 300]
 ```

 */
export function zipAsArray<V>(...args: (Observable<V> | Observable<V>[])[]): Observable<V[]> {
  let streams = _.map(((s: Observable<V>) => s.toEventStream()), argumentsToObservables(args));
  return when([streams, (...xs: V[]) => xs]).withDesc(new Desc("Bacon", "zipAsArray", args));
}


/**
 Like [`zipAsArray`](#bacon-zipasarray) but uses the given n-ary
 function to combine the n values from n sources, instead of returning them in an Array.
 */

export function zipWith<Out>(f: (...any: any[]) => Out, ...streams: Observable<any>[]): EventStream<Out> {
  var [streams, f] = argumentsToObservablesAndFunction<Out>(arguments);
  streams = _.map(((s: Observable<any>) => s.toEventStream()), streams);
  return when([streams, f]).withDesc(new Desc("Bacon", "zipWith", (<any[]>[f]).concat(streams)));
};


/** @hidden */
export function zip<V, V2, Out>(left: Observable<V>, right: Observable<V2>, f: (left: V, right: V2) => Out): EventStream<Out> {
  return zipWith<Out>(f || Array, left, right).withDesc(new Desc(left, "zip", [right]));
}
