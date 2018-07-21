import { argumentsToObservables, argumentsToObservablesAndFunction } from "./argumentstoobservables";
import "./sample";
import Bacon from "./core";
import Observable, { EventStream } from "./observable";
import _ from "./_";
import { Desc } from "./describe";

export function zipAsArray<V>(...args: (Observable<V> | Observable<V>[])[]): Observable<V[]> {
  let streams = _.map(((s) => s.toEventStream()), argumentsToObservables(args));
  return Bacon.when(streams, (...xs) => xs).withDesc(new Desc(Bacon, "zipAsArray", args));
}

Bacon.zipAsArray = zipAsArray

// TODO: quite untyped
export function zipWith(...args): EventStream<any> {
  var [streams, f] = argumentsToObservablesAndFunction(args);
  streams = _.map(((s) => s.toEventStream()), streams);
  return Bacon.when(streams, f).withDesc(new Desc(Bacon, "zipWith", (<any[]>[f]).concat(streams)));
};

Bacon.zipWith = zipWith

export function zip<V, V2, Out>(left: Observable<V>, right: Observable<V2>, f: (V, V2) => Out): EventStream<Out> {
  return Bacon.zipWith([left, right], f || Array).withDesc(new Desc(left, "zip", [right]));
}
