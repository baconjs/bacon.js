import Bacon from "./core";
import { Desc } from "./describe";
import fromBinder from "./frombinder";
import _ from "./_";

const B$ = {
  asEventStream(eventName, selector, eventTransformer) {
    if (_.isFunction(selector)) {
      eventTransformer = selector;
      selector = undefined;
    }

    return fromBinder((handler) => {
      (<any>this).on(eventName, selector, handler);
      return (() => (<any>this).off(eventName, selector, handler));
    }, eventTransformer).withDesc(new Desc((<any>this).selector || this, "asEventStream", [eventName]));
  },
  init($) {
    $.fn.asEventStream = B$.asEventStream;
  }
}

Bacon.$ = B$