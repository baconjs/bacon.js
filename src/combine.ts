import "./map";
import constant from "./constant";
import { whenP } from "./when";
import { argumentsToObservables, argumentsToObservablesAndFunction } from "./argumentstoobservables";
import { Desc } from "./describe";
import { isObservable } from "./helpers";
import { DefaultSource, Source } from "./source";
import Observable from "./observable";
import { Property } from "./observable";;

export function combineAsArray<V>(...streams: (Observable<V> | Observable<V>[])[]) {
  streams = argumentsToObservables(streams)
  if (streams.length) {
    var sources: Source<V, V>[] = [];
    for (var i = 0; i < streams.length; i++) {
      let stream: Observable<V> = <any>(isObservable(streams[i])
        ? streams[i]
        : constant(streams[i]))
      sources.push(wrap(stream));
    }
    return whenP([sources, (...xs) => xs]).withDesc(new Desc("Bacon", "combineAsArray", streams));
  } else {
    return constant([]);
  }
}

// TODO: untyped
export function combineWith() {
  var [streams, f] = argumentsToObservablesAndFunction(arguments);
  var desc = new Desc("Bacon", "combineWith", [f, ...streams]);
  return combineAsArray(streams).map(function (values) {
    return f(...values);
  }).withDesc(desc);
};

export function combine<V, V2, R>(left: Observable<V>, right: Observable<V2>, f: (V, V2) => R): Property<R> {
  return whenP([[wrap(left), wrap(right)], f]).withDesc(new Desc(left, "combine", [right, f]));
};

function wrap<V>(obs: Observable<V>): DefaultSource<V> {
  return new DefaultSource<V>(obs, true)
}