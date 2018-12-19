import Exception from './exception';
import { Desc } from './describe';
import fromBinder, { EventTransformer } from './frombinder';
import _ from './_';
import { EventStream } from "./observable";

export type EventSourceFn = (binder: Function, listener: Function) => any

function isEventSourceFn(x: any): x is EventSourceFn {
  return _.isFunction(x)
}

// Wrap DOM EventTarget, Node EventEmitter, or
// [un]bind: (Any, (Any) -> None) -> None interfaces
// common in MVCs as EventStream
//
// target - EventTarget or EventEmitter, source of events
// eventSource - event name to bind or a function that performs custom binding
// eventTransformer - defaults to returning the first argument to handler
//
// Examples
//
//   Bacon.fromEventTarget(document.body, "click")
//   # => EventStream
//
//   Bacon.fromEventTarget(document.body, "scroll", {passive: true})
//   # => EventStream
//
//   Bacon.fromEventTarget (new EventEmitter(), "data")
//   # => EventStream
//
// Returns EventStream
/** @hidden */
var eventMethods = [
  ["addEventListener","removeEventListener"],
  ["addListener", "removeListener"],
  ["on", "off"],
  ["bind", "unbind"]
];

var findHandlerMethods = function(target: any): [Function, Function] {
  var pair;
  for (var i = 0; i < eventMethods.length; i++) {
    pair = eventMethods[i];
    var methodPair = [target[pair[0]], target[pair[1]]];
    if (methodPair[0] && methodPair[1]) { return <any>methodPair; }
  }
  for (var j = 0; j < eventMethods.length; j++) {
    pair = eventMethods[j];
    var addListener = target[pair[0]];
    if (addListener) { return [addListener, function() {}]; }
  }
  throw new Exception("No suitable event methods in " + target);
};

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
export default function fromEvent<V>(target: any, eventSource: string | EventSourceFn, eventTransformer: EventTransformer<V>): EventStream<V> {
  var [sub, unsub] = findHandlerMethods(target);
  var desc = new Desc("Bacon", "fromEvent", [target, eventSource]);
  return fromBinder<V>(function (handler) {
    if (isEventSourceFn(eventSource)) {
      eventSource(sub.bind(target), handler);
      return function () {
        return eventSource(unsub.bind(target), handler);
      }
    } else {
      sub.call(target, eventSource, handler);
      return function () {
        return unsub.call(target, eventSource, handler);
      };
    }
  }, eventTransformer).withDesc(desc);
}
