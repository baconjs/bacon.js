import { combineAsArray } from "./combine";
import { Desc } from "./describe";
import { isArray, isObservable } from "./helpers";
import _ from "./_";
import Observable, { Property } from "./observable";
import constant from "./constant";

/**
 Combines Properties, EventStreams and constant values using a template
 object. For instance, assuming you've got streams or properties named
 `password`, `username`, `firstname` and `lastname`, you can do

 ```js
 var password, username, firstname, lastname; // <- properties or streams
 var loginInfo = Bacon.combineTemplate({
    magicNumber: 3,
    userid: username,
    passwd: password,
    name: { first: firstname, last: lastname }})
 ```

 .. and your new loginInfo property will combine values from all these
 streams using that template, whenever any of the streams/properties
 get a new value. For instance, it could yield a value such as

 ```js
 { magicNumber: 3,
   userid: "juha",
   passwd: "easy",
   name : { first: "juha", last: "paananen" }}
 ```

 In addition to combining data from streams, you can include constant
 values in your templates.

 Note that all Bacon.combine* methods produce a Property instead of an EventStream.
 If you need the result as an [`EventStream`](classes/eventstream.html) you might want to use [`property.changes()`](classes/property.html#changes)

 ```js
 Bacon.combineWith(function(v1,v2) { .. }, stream1, stream2).changes()
 ```
 */

type Ctx = any
export default function combineTemplate(template: any): Property<any> {
  function current(ctxStack: Ctx[]) { return ctxStack[ctxStack.length - 1]; }
  function setValue(ctxStack: Ctx[], key: any, value: any) {
    (<any>current(ctxStack))[key] = value;
    return value;
  }
  function applyStreamValue(key: any, index: number) {
    return function(ctxStack: Ctx[], values: any[]) {
      setValue(ctxStack, key, values[index]);
    };
  }
  function constantValue(key: any, value: any) {
    return function(ctxStack: Ctx[]) {
      setValue(ctxStack, key, value);
    };
  }

  function mkContext(template: any): any {
    return isArray(template) ? [] : {};
  }

  function pushContext(key: any, value: any) {
    return function(ctxStack: Ctx[]) {
      const newContext = mkContext(value);
      setValue(ctxStack, key, newContext);
      ctxStack.push(newContext);
    };
  }

  function containsObservables(value: any) {
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

  function compile(key: any, value: any) {
    if (isObservable(value)) {
      streams.push(value);
      funcs.push(applyStreamValue(key, streams.length - 1));
    } else if (containsObservables(value)) {
      const popContext = function(ctxStack: Ctx[]) { ctxStack.pop(); };
      funcs.push(pushContext(key, value));
      compileTemplate(value);
      funcs.push(popContext);
    } else {
      funcs.push(constantValue(key, value));
    }
  }

  function combinator(values: any[]) {
    const rootContext = mkContext(template);
    const ctxStack = [rootContext];
    for (var i = 0, f; i < funcs.length; i++) {
      f = funcs[i];
      f(ctxStack, values);
    }
    return rootContext;
  }

  function compileTemplate(template: any) { _.each(template, compile); }

  const funcs: Function[] = [];
  const streams: Observable<any>[] = [];

  const resultProperty = containsObservables(template) 
    ? (compileTemplate(template), combineAsArray(streams).map(combinator))
    : constant(template)

  return resultProperty.withDesc(new Desc("Bacon", "combineTemplate", [template]));
}
