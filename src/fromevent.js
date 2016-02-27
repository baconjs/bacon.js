import Exception from './exception';
import { Desc, withDesc } from './describe';
import fromBinder from './frombinder';
import Bacon from './core';

// Wrap DOM EventTarget, Node EventEmitter, or
// [un]bind: (Any, (Any) -> None) -> None interfaces
// common in MVCs as EventStream
//
// target - EventTarget or EventEmitter, source of events
// eventName - event name to bind
// eventTransformer - defaults to returning the first argument to handler
//
// Examples
//
//   Bacon.fromEventTarget(document.body, "click")
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

var findHandlerMethods = function(target) {
  var pair;
  for (var i = 0; i < eventMethods.length; i++) {
    pair = eventMethods[i];
    var methodPair = [target[pair[0]], target[pair[1]]];
    if (methodPair[0] && methodPair[1]) { return methodPair; }
  }
  for (var j = 0; j < eventMethods.length; j++) {
    pair = eventMethods[j];
    var addListener = target[pair[0]];
    if (addListener) { return [addListener, function() {}]; }
  }
  throw new Exception("No suitable event methods in " + target);
};

export default function fromEventTarget(target, eventName, eventTransformer) {
  var [sub, unsub] = findHandlerMethods(target);
  var desc = new Desc(Bacon, "fromEvent", [target, eventName]);
  return withDesc(desc, fromBinder(function(handler) {
    sub.call(target, eventName, handler);
    return function() {
      return unsub.call(target, eventName, handler);
    };
  }, eventTransformer));
}

Bacon.fromEvent = Bacon.fromEventTarget = fromEventTarget;
