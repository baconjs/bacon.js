import fromBinder, { EventTransformer } from "./frombinder";
import { withDesc, Desc } from "./describe";
import { Error, endEvent } from "./event";
import Bacon from "./core";
import EventStream from "./eventstream";

function valueAndEnd(value) {
  return [value, endEvent()];
}

export default function fromPromise<V>(promise: Promise<V>, abort, eventTransformer: EventTransformer<V> = valueAndEnd): EventStream<V> {
  return withDesc(new Desc(Bacon, "fromPromise", [promise]), fromBinder(function(handler) {
    const bound = promise.then(handler, (e) => handler(new Error(e)));
    if (bound && typeof (<any>bound).done === "function") {
      (<any>bound).done();
    }

    if (abort) {
      return function() {
        if (typeof (<any>promise).abort === "function") {
          return (<any>promise).abort();
        }
      };
    } else {
      return function() {};
    }
  }, eventTransformer));
}

Bacon.fromPromise = fromPromise;
