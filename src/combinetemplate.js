import "./combine";
import { Desc, withDesc } from "./describe";
import { isArray, isObservable } from "./helpers";
import _ from "./_";
import Bacon from "./core";

export default function combineTemplate(template) {
  function current(ctxStack) { return ctxStack[ctxStack.length - 1]; }
  function setValue(ctxStack, key, value) {
    current(ctxStack)[key] = value;
    return value;
  }
  function applyStreamValue(key, index) {
    return function(ctxStack, values) {
      return setValue(ctxStack, key, values[index]);
    };
  }
  function constantValue(key, value) {
    return function(ctxStack) {
      return setValue(ctxStack, key, value);
    };
  }

  function mkContext(template) {
    return isArray(template) ? [] : {};
  }

  function pushContext(key, value) {
    return function(ctxStack) {
      var newContext = mkContext(value);
      setValue(ctxStack, key, newContext);
      return ctxStack.push(newContext);
    };
  }

  function compile(key, value) {
    if (isObservable(value)) {
      streams.push(value);
      return funcs.push(applyStreamValue(key, streams.length - 1));
    } else if (value && (value.constructor == Object || value.constructor == Array)) {
      var popContext = function(ctxStack) { return ctxStack.pop(); };
      funcs.push(pushContext(key, value));
      compileTemplate(value);
      return funcs.push(popContext);
    } else {
      return funcs.push(constantValue(key, value));
    }
  }

  function combinator(values) {
    var rootContext = mkContext(template);
    var ctxStack = [rootContext];
    for (var i = 0, f; i < funcs.length; i++) {
      f = funcs[i];
      f(ctxStack, values);
    }
    return rootContext;
  }

  function compileTemplate(template) { return _.each(template, compile); }

  var funcs = [];
  var streams = [];

  compileTemplate(template);

  return withDesc(new Desc(Bacon, "combineTemplate", [template]), Bacon.combineAsArray(streams).map(combinator));
}

Bacon.combineTemplate = combineTemplate;
