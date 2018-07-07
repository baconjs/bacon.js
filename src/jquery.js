import Bacon from "./core";
import { Desc } from "./describe";
import fromBinder from "./frombinder";
import _ from "./_";

// eventTransformer - defaults to returning the first argument to handler
Bacon.$ = {};
Bacon.$.asEventStream = function(eventName, selector, eventTransformer) {
  if (_.isFunction(selector)) {
    eventTransformer = selector;
    selector = undefined;
  }

  return fromBinder((handler) => {
    this.on(eventName, selector, handler);
    return (() => this.off(eventName, selector, handler));
  }, eventTransformer).withDesc(new Desc(this.selector || this, "asEventStream", [eventName]));
};

if (typeof jQuery !== "undefined" && jQuery) {
  jQuery.fn.asEventStream = Bacon.$.asEventStream;
}

if (typeof Zepto !== "undefined" && Zepto) {
  Zepto.fn.asEventStream = Bacon.$.asEventStream;
}
