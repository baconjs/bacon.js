import { Desc } from "./describe";
import fromBinder from "./frombinder";
import _ from "./_";

export const $ = {
  /**
   Creates an EventStream from events on a
   jQuery or Zepto.js object. You can pass optional arguments to add a
   jQuery live selector and/or a function that processes the jQuery
   event and its parameters, if given, like this:

   ```js
   $("#my-div").asEventStream("click", ".more-specific-selector")
   $("#my-div").asEventStream("click", ".more-specific-selector", function(event, args) { return args[0] })
   $("#my-div").asEventStream("click", function(event, args) { return args[0] })
   ```

   Note: you need to install the `asEventStream` method on JQuery by calling
   [init()](#_.aseventstream) as in `Bacon.$.init($)`.
   */
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
    $.fn.asEventStream = $.asEventStream;
  }
}