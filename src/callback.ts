import { Desc } from "./describe";
import { endEvent, Error } from "./event";
import { makeFunction } from "./functionconstruction";
import fromBinder from "./frombinder";
import { nop } from "./helpers";
import { EventStream } from "./observable";

export function fromCallback<V>(f, ...args): EventStream<V> {
  return fromBinder<V>(
    function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    },
    function(value) {
      return [value, endEvent()];
    }
  ).withDesc(new Desc("Bacon", "fromCallback", [f, ...args]))
}

export function fromNodeCallback<V>(f, ...args): EventStream<V> {
  return fromBinder<V>(
    function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    },
    function(error, value) {
      if (error) {
        return [new Error(error), endEvent()]
      }
      return [value, endEvent()];
    }
  ).withDesc(new Desc("Bacon", "fromNodeCallback", [f, ...args]))
}