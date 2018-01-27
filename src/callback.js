import "./combine";
import "./flatmap";
import { withDesc, Desc } from "./describe";
import { endEvent, Error } from "./event";
import { makeFunction, partiallyApplied, withMethodCallSupport } from "./functionconstruction";
import fromBinder from "./frombinder";
import { nop } from "./helpers";
import Bacon from "./core";

var liftCallback = function(desc, wrapped) {
  return withMethodCallSupport(function(f, ...args) {
    var stream = partiallyApplied(wrapped, [function(values, callback) {
      return f(...values.concat([callback]));
    }]);
    return withDesc(new Desc(Bacon, desc, [f, ...args]), Bacon.combineAsArray(args).flatMap(stream).changes());
  });
};

Bacon.fromCallback = liftCallback("fromCallback", function(f, ...args) {
  return fromBinder(function(handler) {
    makeFunction(f, args)(handler);
    return nop;
  }, (function(value) { return [value, endEvent()]; }));
});

Bacon.fromNodeCallback = liftCallback("fromNodeCallback", function(f, ...args) {
  return fromBinder(function(handler) {
    makeFunction(f, args)(handler);
    return nop;
  }, function(error, value) {
    if (error) { return [new Error(error), endEvent()]; }
    return [value, endEvent()];
  });
});
