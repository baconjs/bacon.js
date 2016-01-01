import { argumentsToObservables, argumentsToObservablesAndFunction } from "./argumentstoobservables";
import "./sample";
import Bacon from "./core";
import Observable from "./observable";
import _ from "./_";
import { withDesc, Desc } from "./describe";

Bacon.zipAsArray = function(...args) {
  var streams = argumentsToObservables(args);
  return withDesc(
    new Desc(Bacon, "zipAsArray", streams),
    Bacon.zipWith(streams, (...xs) => xs));
};

Bacon.zipWith = function(...args) {
  var observablesAndFunction = argumentsToObservablesAndFunction(args);
  var streams = observablesAndFunction[0];
  var f = observablesAndFunction[1];

  streams = _.map(((s) => s.toEventStream()), streams);
  return withDesc(
    new Desc(Bacon, "zipWith", [f].concat(streams)),
    Bacon.when(streams, f));
};

Observable.prototype.zip = function(other, f) {
  return withDesc(
    new Desc(this, "zip", [other]),
    Bacon.zipWith([this, other], f || Array));
};
