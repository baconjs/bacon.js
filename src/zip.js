import { argumentsToObservables, argumentsToObservablesAndFunction } from "./argumentstoobservables";
import "./sample";
import Bacon from "./core";
import Observable from "./observable";
import _ from "./_";
import { Desc } from "./describe";

Bacon.zipAsArray = function(...args) {
  var streams = argumentsToObservables(args);
  return Bacon.zipWith(streams, (...xs) => xs).withDesc(new Desc(Bacon, "zipAsArray", streams));
};

Bacon.zipWith = function(...args) {
  var observablesAndFunction = argumentsToObservablesAndFunction(args);
  var streams = observablesAndFunction[0];
  var f = observablesAndFunction[1];

  streams = _.map(((s) => s.toEventStream()), streams);
  return Bacon.when(streams, f).withDesc(new Desc(Bacon, "zipWith", [f].concat(streams)));
};

Observable.prototype.zip = function(other, f) {
  return Bacon.zipWith([this, other], f || Array).withDesc(new Desc(this, "zip", [other]));
};
