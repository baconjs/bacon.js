import { combineAsArray } from "./combine";
import { Desc } from "./describe";
import { isArray, isObservable } from "./helpers";
import _ from "./_";
import Observable, { Property } from "./observable";
import constant from "./constant";

export default function combineTemplate(template): Property<any> {
  function current(ctxStack) { return ctxStack[ctxStack.length - 1]; }
  function setValue(ctxStack, key, value) {
    current(ctxStack)[key] = value;
    return value;
  }
  function applyStreamValue(key, index) {
    return function(ctxStack, values) {
      setValue(ctxStack, key, values[index]);
    };
  }
  function constantValue(key, value) {
    return function(ctxStack) {
      setValue(ctxStack, key, value);
    };
  }

  function mkContext(template) {
    return isArray(template) ? [] : {};
  }

  function pushContext(key, value) {
    return function(ctxStack) {
      const newContext = mkContext(value);
      setValue(ctxStack, key, newContext);
      ctxStack.push(newContext);
    };
  }

  function containsObservables(value) {
    if (isObservable(value)) {
      return true
    } else if (value && (value.constructor == Object || value.constructor == Array)) {
      for (var key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const child = value[key];
          if (containsObservables(child))
            return true
        }
      }
    }
  }

  function compile(key, value) {
    if (isObservable(value)) {
      streams.push(value);
      funcs.push(applyStreamValue(key, streams.length - 1));
    } else if (containsObservables(value)) {
      const popContext = function(ctxStack) { ctxStack.pop(); };
      funcs.push(pushContext(key, value));
      compileTemplate(value);
      funcs.push(popContext);
    } else {
      funcs.push(constantValue(key, value));
    }
  }

  function combinator(values) {
    const rootContext = mkContext(template);
    const ctxStack = [rootContext];
    for (var i = 0, f; i < funcs.length; i++) {
      f = funcs[i];
      f(ctxStack, values);
    }
    return rootContext;
  }

  function compileTemplate(template) { _.each(template, compile); }

  const funcs: Function[] = [];
  const streams: Observable<any>[] = [];

  const resultProperty = containsObservables(template) 
    ? (compileTemplate(template), combineAsArray(streams).map(combinator))
    : constant(template)

  return resultProperty.withDesc(new Desc("Bacon", "combineTemplate", [template]));
}