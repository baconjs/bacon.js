import { EventTransformer } from './frombinder';
import { EventStream } from "./observable";
export declare type EventSourceFn = (binder: Function, listener: Function) => any;
/**
 creates an EventStream from events
 on a DOM EventTarget or Node.JS EventEmitter object, or an object that supports event listeners using `on`/`off` methods.
 You can also pass an optional function that transforms the emitted
 events' parameters.

 The simple form:

 ```js
 Bacon.fromEvent(document.body, "click").onValue(function() { alert("Bacon!") })
 ```

 Using a binder function:

 ```js
 Bacon.fromEvent(
 window,
 function(binder, listener) {
    binder("scroll", listener, {passive: true})
  }
 ).onValue(function() {
  console.log(window.scrollY)
})
 ```

 @param target
 @param eventSource
 @param eventTransformer
 @typeparam V Type of stream elements

 */
export default function fromEvent<V>(target: any, eventSource: string | EventSourceFn, eventTransformer?: EventTransformer<V>): EventStream<V>;
