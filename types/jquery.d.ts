import { EventStream } from "./observable";
/**
 * JQuery/Zepto integration support
 */
export declare const $: {
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
    asEventStream(eventName: string, selector: string | undefined, eventTransformer: any): EventStream<any>;
    /**
     * Installs the [asEventStream](#_.aseventstream) to the given jQuery/Zepto object (the `$` object).
     */
    init(jQuery: any): void;
};
