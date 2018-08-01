import { EventStream } from "./observable";
/**
 creates an EventStream from events
 on a DOM EventTarget or Node.JS EventEmitter object, or an object that supports event listeners using `on`/`off` methods.
 You can also pass an optional function that transforms the emitted
 events' parameters.

 ```js
 Bacon.fromEvent(document.body, "click").onValue(function() { alert("Bacon!") })
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
export default function fromEvent<V>(target: any, eventSource: any, eventTransformer: any): EventStream<V>;
