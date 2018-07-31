import { argumentsToObservables, argumentsToObservablesAndFunction } from "./internal/argumentstoobservables";
import "./sample";
import Observable, { EventStream } from "./observable";
import _ from "./_";
import { Desc } from "./describe";
import when from "./when";

export function zipAsArray<V>(...args: (Observable<V> | Observable<V>[])[]): Observable<V[]> {
  let streams = _.map(((s) => s.toEventStream()), argumentsToObservables(args));
  return when([streams, (...xs) => xs]).withDesc(new Desc("Bacon", "zipAsArray", args));
}


// TODO: quite untyped
export function zipWith(...args): EventStream<any> {
  var [streams, f] = argumentsToObservablesAndFunction(args);
  streams = _.map(((s) => s.toEventStream()), streams);
  return when([streams, f]).withDesc(new Desc("Bacon", "zipWith", (<any[]>[f]).concat(streams)));
};


/** @hidden */
export function zip<V, V2, Out>(left: Observable<V>, right: Observable<V2>, f: (V, V2) => Out): EventStream<Out> {
  return zipWith([left, right], f || Array).withDesc(new Desc(left, "zip", [right]));
}
