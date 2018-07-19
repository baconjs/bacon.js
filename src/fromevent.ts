import Exception from './exception';
import { Desc } from './describe';
import fromBinder from './frombinder';
import Bacon from './core';
import _ from './_';
import { EventStream } from "./observable";

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
var eventMethods = [
  ["addEventListener","removeEventListener"],
  ["addListener", "removeListener"],
  ["on", "off"],
  ["bind", "unbind"]
];

var findHandlerMethods = function(target): [Function, Function] {
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

export default function fromEventTarget<V>(target, eventSource, eventTransformer): EventStream<V> {
  var [sub, unsub] = findHandlerMethods(target);
  var desc = new Desc(Bacon, "fromEvent", [target, eventSource]);
  return fromBinder<V>(function (handler) {
    if (_.isFunction(eventSource)) {
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

Bacon.fromEvent = Bacon.fromEventTarget = fromEventTarget;
