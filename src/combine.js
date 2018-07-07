import "./map";
import constant from "./constant";
import { whenP } from "./when";
import { argumentsToObservables, argumentsToObservablesAndFunction } from "./argumentstoobservables";
import { Desc } from "./describe";
import { toCombinator } from "./functionconstruction";
import { isObservable } from "./helpers";
import { DefaultSource } from "./source";
import Observable from "./observable";
import Bacon from "./core";

Bacon.combineAsArray = function() {
  var streams = argumentsToObservables(arguments)
  if (streams.length) {
    var sources = [];
    for (var i = 0; i < streams.length; i++) {
      let stream = isObservable(streams[i])
        ? streams[i]
        : Bacon.constant(streams[i])
      sources.push(new DefaultSource(stream, true));
    }
    return whenP(sources, function (...xs) {
      return xs;
    }).withDesc(new Bacon.Desc(Bacon, "combineAsArray", streams));
  } else {
    return constant([]);
  }
};

Bacon.onValues = function() {
  return Bacon.combineAsArray(
    Array.prototype.slice.call(arguments, 0, arguments.length - 1)
  ).onValues(arguments[arguments.length - 1]);
};

Bacon.combineWith = function() {
  var [streams, f] = argumentsToObservablesAndFunction(arguments);
  var desc = new Desc(Bacon, "combineWith", [f, ...streams]);
  return Bacon.combineAsArray(streams).map(function (values) {
    return f(...values);
  }).withDesc(desc);
};

Observable.prototype.combine = function(other, f) {
  var combinator = toCombinator(f);
  var desc = new Desc(this, "combine", [other, f]);
  return Bacon.combineAsArray(this, other).map(function (values) {
    return combinator(values[0], values[1]);
  }).withDesc(desc);
};
