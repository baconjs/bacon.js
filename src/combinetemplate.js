// build-dependencies: combine

Bacon.combineTemplate = function(template) {
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
      var newContext = mkContext(value);
      setValue(ctxStack, key, newContext);
      ctxStack.push(newContext);
    };
  }

  function compile(key, value) {
    if (isObservable(value)) {
      streams.push(value);
      funcs.push(applyStreamValue(key, streams.length - 1));
    } else if (value && (value.constructor == Object || value.constructor == Array)) {
      var popContext = function(ctxStack) { ctxStack.pop(); };
      funcs.push(pushContext(key, value));
      compileTemplate(value);
      funcs.push(popContext);
    } else {
      funcs.push(constantValue(key, value));
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

  function compileTemplate(template) { _.each(template, compile); }

  var funcs = [];
  var streams = [];

  compileTemplate(template);

  return withDesc(new Bacon.Desc(Bacon, "combineTemplate", [template]), Bacon.combineAsArray(streams).map(combinator));
};
