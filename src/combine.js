import "./map";
import constant from "./constant";
import when from "./when";
import { argumentsToObservables, argumentsToObservablesAndFunction } from "./argumentstoobservables";
import { withDesc, Desc } from "./describe";
import { toCombinator } from "./functionconstruction";
import { isObservable } from "./helpers";
import { Source } from "./source";
import Observable from "./observable";
import Bacon from "./core";

Bacon.combineAsArray = function() {
  var streams = argumentsToObservables(arguments);
  for (var index = 0, stream; index < streams.length; index++) {
    stream = streams[index];
    if (!isObservable(stream)) {
      streams[index] = constant(stream);
    }
  }
  if (streams.length) {
    var sources = (() => {
      var result = [];
      for (var i = 0, s; i < streams.length; i++) {
        s = streams[i];
        result.push(new Source(s, true));
      }
      return result;
    })();
    return withDesc(new Desc(Bacon, "combineAsArray", streams), when(sources, (function(...xs) { return xs; })).toProperty());
  } else {
    return constant([]);
  }
};

Bacon.onValues = function(...streams) {
  return Bacon.combineAsArray(streams.slice(0, streams.length - 1)).onValues(streams[streams.length - 1]);
};

Bacon.combineWith = function() {
  var [streams, f] = argumentsToObservablesAndFunction(arguments);
  var desc = new Desc(Bacon, "combineWith", [f, ...streams]);
  return withDesc(desc, Bacon.combineAsArray(streams).map(function(values) { return f(...values); }));
};

Observable.prototype.combine = function(other, f) {
  var combinator = toCombinator(f);
  var desc = new Desc(this, "combine", [other, f]);
  return withDesc(desc, Bacon.combineAsArray(this, other).map(function(values) { return combinator(values[0], values[1]); }));
};
