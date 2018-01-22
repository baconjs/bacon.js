import fromBinder from "./frombinder";
import { withDesc, Desc } from "./describe";
import { Error, endEvent } from "./event";
import Bacon from "./core";

function valueAndEnd(value) {
  return [value, endEvent()];
}

export default function fromPromise(promise, abort, eventTransformer=valueAndEnd) {
  return withDesc(new Desc(Bacon, "fromPromise", [promise]), fromBinder(function(handler) {
    const bound = promise.then(handler, (e) => handler(new Error(e)));
    if (bound && typeof bound.done === "function") {
      bound.done();
    }

    if (abort) {
      return function() {
        if (typeof promise.abort === "function") {
          return promise.abort();
        }
      };
    } else {
      return function() {};
    }
  }, eventTransformer));
}

Bacon.fromPromise = fromPromise;
