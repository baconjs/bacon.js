(function(){
  var Bacon, ref$, withMethodCallSupport, liftCallback, Event, Next, Initial, End, Error, Observable, reduce, EventStream, Property, convertArgsToFunction, addPropertyInitValueToStream, Dispatcher, PropertyDispatcher, PropertyTransaction, Bus, Source, compositeUnsubscribe, CompositeUnsubscribe, Some, None, nop, latterF, former, initial, next, end, toEvent, cloneArray, indexOf, assert, assertEvent, assertEventStream, assertFunction, isFunction, assertArray, assertNoArguments, assertString, partiallyApplied, makeSpawner, makeFunctionArgs, makeFunction_, makeFunction, isFieldKey, toFieldExtractor, toSimpleExtractor, toFieldKey, toCombinator, toOption, _, slice$ = [].slice;
  Bacon = {};
  Bacon.version = '<version>';
  Bacon.fromBinder = function(binder, eventTransformer){
    eventTransformer == null && (eventTransformer = _.id);
    return new EventStream(function(sink){
      var unbinder;
      return unbinder = binder(function(){
        var args, value, reply, i$, len$, event;
        args = slice$.call(arguments);
        value = eventTransformer.apply(null, args);
        if (!(value instanceof Array && _.last(value) instanceof Event)) {
          value = [value];
        }
        reply = Bacon.more;
        for (i$ = 0, len$ = value.length; i$ < len$; ++i$) {
          event = value[i$];
          reply = sink(event = toEvent(event));
          if (reply === Bacon.noMore || event.isEnd()) {
            if (unbinder != null) {
              unbinder();
            } else {
              Bacon.scheduler.setTimeout(fn$, 0);
            }
            return reply;
          }
        }
        return reply;
        function fn$(){
          return unbinder();
        }
      });
    });
  };
  Bacon.$ = {
    asEventStream: function(eventName, selector, eventTransformer){
      var ref$, this$ = this;
      if (isFunction(selector)) {
        ref$ = [selector, null], eventTransformer = ref$[0], selector = ref$[1];
      }
      return Bacon.fromBinder(function(handler){
        this$.on(eventName, selector, handler);
        return function(){
          return this$.off(eventName, selector, handler);
        };
      }, eventTransformer);
    }
  };
  if ((ref$ = typeof jQuery != 'undefined' && jQuery !== null
    ? jQuery
    : typeof Zepto != 'undefined' && Zepto !== null ? Zepto : null) != null) {
    ref$.fn.asEventStream = Bacon.$.asEventStream;
  }
  Bacon.fromEventTarget = function(target, eventName, eventTransformer){
    var sub, ref$, unsub;
    sub = (ref$ = target.addEventListener) != null
      ? ref$
      : (ref$ = target.addListener) != null
        ? ref$
        : target.bind;
    unsub = (ref$ = target.removeEventListener) != null
      ? ref$
      : (ref$ = target.removeListener) != null
        ? ref$
        : target.unbind;
    return Bacon.fromBinder(function(handler){
      sub.call(target, eventName, handler);
      return function(){
        return unsub.call(target, eventName, handler);
      };
    }, eventTransformer);
  };
  Bacon.fromPromise = function(promise, abort){
    return Bacon.fromBinder(function(handler){
      promise.then(handler, function(e){
        return handler(new Error(e));
      });
      return function(){
        if (abort) {
          return typeof promise.abort === 'function' ? promise.abort() : void 8;
        }
      };
    }, function(value){
      return [value, end()];
    });
  };
  Bacon.noMore = ["<no-more>"];
  Bacon.more = ["<more>"];
  Bacon.later = function(delay, value){
    return Bacon.sequentially(delay, [value]);
  };
  Bacon.sequentially = function(delay, values){
    var index;
    index = 0;
    return Bacon.fromPoll(delay, function(){
      var value;
      value = values[index++];
      if (index < values.length) {
        return value;
      } else if (index === values.length) {
        return [value, end()];
      } else {
        return end();
      }
    });
  };
  Bacon.repeatedly = function(delay, values){
    var index;
    index = 0;
    return Bacon.fromPoll(delay, function(){
      return values[index++ % values.length];
    });
  };
  withMethodCallSupport = function(wrapped){
    return function(f){
      var args, context, methodName;
      args = slice$.call(arguments, 1);
      if (typeof f === "object" && args.length) {
        context = f;
        methodName = args[0];
        f = function(){
          return context[methodName].apply(context, arguments);
        };
        args = args.slice(1);
      }
      return wrapped.apply(null, [f].concat(slice$.call(args)));
    };
  };
  liftCallback = function(wrapped){
    return withMethodCallSupport(function(f){
      var args, stream;
      args = slice$.call(arguments, 1);
      stream = partiallyApplied(wrapped, [function(values, callback){
        return f.apply(null, slice$.call(values).concat([callback]));
      }]);
      return Bacon.combineAsArray(args).flatMap(stream);
    });
  };
  Bacon.fromCallback = liftCallback(function(f){
    var args;
    args = slice$.call(arguments, 1);
    return Bacon.fromBinder(function(handler){
      makeFunction(f, args)(handler);
      return nop;
    }, function(value){
      return [value, end()];
    });
  });
  Bacon.fromNodeCallback = liftCallback(function(f){
    var args;
    args = slice$.call(arguments, 1);
    return Bacon.fromBinder(function(handler){
      makeFunction(f, args)(handler);
      return nop;
    }, function(error, value){
      if (error) {
        return [new Error(error), end()];
      }
      return [value, end()];
    });
  });
  Bacon.fromPoll = function(delay, poll){
    return Bacon.fromBinder(function(handler){
      var id;
      id = Bacon.scheduler.setInterval(handler, delay);
      return function(){
        return Bacon.scheduler.clearInterval(id);
      };
    }, poll);
  };
  Bacon.interval = function(delay, value){
    if (value == null) {
      value = {};
    }
    return Bacon.fromPoll(delay, function(){
      return next(value);
    });
  };
  Bacon.constant = function(value){
    return new Property(function(sink){
      sink(initial(value));
      sink(end());
      return nop;
    });
  };
  Bacon.never = function(){
    return Bacon.fromArray([]);
  };
  Bacon.once = function(value){
    return Bacon.fromArray([value]);
  };
  Bacon.fromArray = function(values){
    assertArray(values);
    values = cloneArray(values);
    return new EventStream(function(sink){
      var unsubd, send;
      unsubd = false;
      send = function(){
        var value, reply;
        if (_.empty(values)) {
          return sink(end());
        } else {
          value = values.splice(0, 1)[0];
          reply = sink(toEvent(value));
          if (reply !== Bacon.noMore && !unsubd) {
            return send();
          }
        }
      };
      send();
      return function(){
        var unsubd;
        return unsubd = true;
      };
    });
  };
  Bacon.mergeAll = function(){
    var streams;
    streams = slice$.call(arguments);
    if (streams[0] instanceof Array) {
      streams = streams[0];
    }
    return _.fold(streams, Bacon.never(), function(a, b){
      return a.merge(b);
    });
  };
  Bacon.zipAsArray = function(){
    var streams;
    streams = slice$.call(arguments);
    if (streams[0] instanceof Array) {
      streams = streams[0];
    }
    return Bacon.zipWith(streams, function(){
      var xs;
      xs = slice$.call(arguments);
      return xs;
    });
  };
  Bacon.zipWith = function(f){
    var streams, ref$;
    streams = slice$.call(arguments, 1);
    if (!isFunction(f)) {
      ref$ = [f, streams[0]], streams = ref$[0], f = ref$[1];
    }
    return Bacon.when(_.map(function(s){
      return s.toEventStream();
    }, streams), f);
  };
  Bacon.combineAsArray = function(){
    var streams, i$, len$, index, stream, sources, res$, s;
    streams = slice$.call(arguments);
    if (streams.length === 1 && streams[0] instanceof Array) {
      streams = streams[0];
    }
    for (i$ = 0, len$ = streams.length; i$ < len$; ++i$) {
      index = i$;
      stream = streams[i$];
      if (!(stream instanceof Observable)) {
        streams[index] = Bacon.constant(stream);
      }
    }
    if (streams.length) {
      res$ = [];
      for (i$ = 0, len$ = streams.length; i$ < len$; ++i$) {
        s = streams[i$];
        res$.push(new Source(s, true, false, s.subscribeInternal));
      }
      sources = res$;
      return Bacon.when(sources, function(){
        var xs;
        xs = slice$.call(arguments);
        return xs;
      }).toProperty();
    } else {
      return Bacon.constant([]);
    }
  };
  Bacon.onValues = function(){
    var i$, streams, f;
    streams = 0 < (i$ = arguments.length - 1) ? slice$.call(arguments, 0, i$) : (i$ = 0, []), f = arguments[i$];
    return Bacon.combineAsArray(streams).onValues(f);
  };
  Bacon.combineWith = function(f){
    var streams;
    streams = slice$.call(arguments, 1);
    return Bacon.combineAsArray(streams).map(function(values){
      return f.apply(null, values);
    });
  };
  Bacon.combineTemplate = function(template){
    var funcs, streams, current, setValue, applyStreamValue, constantValue, mkContext, compile, compileTemplate, combinator;
    funcs = [];
    streams = [];
    current = function(ctxStack){
      return ctxStack[ctxStack.length - 1];
    };
    setValue = function(ctxStack, key, value){
      return current(ctxStack)[key] = value;
    };
    applyStreamValue = function(key, index){
      return function(ctxStack, values){
        return setValue(ctxStack, key, values[index]);
      };
    };
    constantValue = function(key, value){
      return function(ctxStack){
        return setValue(ctxStack, key, value);
      };
    };
    mkContext = function(template){
      if (template instanceof Array) {
        return [];
      } else {
        return {};
      }
    };
    compile = function(key, value){
      var pushContext, popContext;
      if (value instanceof Observable) {
        streams.push(value);
        return funcs.push(applyStreamValue(key, streams.length - 1));
      } else if (value === Object(value) && typeof value !== "function") {
        pushContext = function(key){
          return function(ctxStack){
            var newContext;
            newContext = mkContext(value);
            setValue(ctxStack, key, newContext);
            return ctxStack.push(newContext);
          };
        };
        popContext = function(ctxStack){
          return ctxStack.pop();
        };
        funcs.push(pushContext(key));
        compileTemplate(value);
        return funcs.push(popContext);
      } else {
        return funcs.push(constantValue(key, value));
      }
    };
    compileTemplate = function(template){
      return _.each(template, compile);
    };
    compileTemplate(template);
    combinator = function(values){
      var rootContext, ctxStack, i$, ref$, len$, f;
      rootContext = mkContext(template);
      ctxStack = [rootContext];
      for (i$ = 0, len$ = (ref$ = funcs).length; i$ < len$; ++i$) {
        f = ref$[i$];
        f(ctxStack, values);
      }
      return rootContext;
    };
    return Bacon.combineAsArray(streams).map(combinator);
  };
  Event = (function(){
    Event.displayName = 'Event';
    var prototype = Event.prototype, constructor = Event;
    prototype.isEvent = function(){
      return true;
    };
    prototype.isEnd = function(){
      return false;
    };
    prototype.isInitial = function(){
      return false;
    };
    prototype.isNext = function(){
      return false;
    };
    prototype.isError = function(){
      return false;
    };
    prototype.hasValue = function(){
      return false;
    };
    prototype.filter = function(){
      return true;
    };
    function Event(){}
    return Event;
  }());
  Next = (function(superclass){
    var prototype = extend$((import$(Next, superclass).displayName = 'Next', Next), superclass).prototype, constructor = Next;
    function Next(valueF){
      if (isFunction(valueF)) {
        this.value = _.cached(valueF);
      } else {
        this.value = _.always(valueF);
      }
    }
    prototype.isNext = function(){
      return true;
    };
    prototype.hasValue = function(){
      return true;
    };
    prototype.fmap = function(f){
      var this$ = this;
      return this.apply(function(){
        return f(this$.value());
      });
    };
    prototype.apply = function(value){
      return new Next(value);
    };
    prototype.filter = function(f){
      return f(this.value());
    };
    prototype.describe = function(){
      return this.value();
    };
    return Next;
  }(Event));
  Initial = (function(superclass){
    var prototype = extend$((import$(Initial, superclass).displayName = 'Initial', Initial), superclass).prototype, constructor = Initial;
    prototype.isInitial = function(){
      return true;
    };
    prototype.isNext = function(){
      return false;
    };
    prototype.apply = function(value){
      return new Initial(value);
    };
    prototype.toNext = function(){
      return new Next(this.value);
    };
    function Initial(){
      Initial.superclass.apply(this, arguments);
    }
    return Initial;
  }(Next));
  End = (function(superclass){
    var prototype = extend$((import$(End, superclass).displayName = 'End', End), superclass).prototype, constructor = End;
    prototype.isEnd = function(){
      return true;
    };
    prototype.fmap = function(){
      return this;
    };
    prototype.apply = function(){
      return this;
    };
    prototype.describe = function(){
      return "<end>";
    };
    function End(){
      End.superclass.apply(this, arguments);
    }
    return End;
  }(Event));
  Error = (function(superclass){
    var prototype = extend$((import$(Error, superclass).displayName = 'Error', Error), superclass).prototype, constructor = Error;
    function Error(error){
      this.error = error;
    }
    prototype.isError = function(){
      return true;
    };
    prototype.fmap = function(){
      return this;
    };
    prototype.apply = function(){
      return this;
    };
    prototype.describe = function(){
      return "<error> " + this.error;
    };
    return Error;
  }(Event));
  Observable = (function(){
    Observable.displayName = 'Observable';
    var prototype = Observable.prototype, constructor = Observable;
    function Observable(){
      this.combine = bind$(this, 'combine', prototype);
      this.flatMapLatest = bind$(this, 'flatMapLatest', prototype);
      this.fold = bind$(this, 'fold', prototype);
      this.scan = bind$(this, 'scan', prototype);
      this.assign = this.onValue;
    }
    prototype.onValue = function(){
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event){
        if (event.hasValue()) {
          return f(event.value());
        }
      });
    };
    prototype.onValues = function(f){
      return this.onValue(function(args){
        return f.apply(null, args);
      });
    };
    prototype.onError = function(){
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event){
        if (event.isError()) {
          return f(event.error);
        }
      });
    };
    prototype.onEnd = function(){
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event){
        if (event.isEnd()) {
          return f();
        }
      });
    };
    prototype.errors = function(){
      return this.filter(function(){
        return false;
      });
    };
    prototype.filter = function(f){
      var args;
      args = slice$.call(arguments, 1);
      return convertArgsToFunction(this, f, args, function(f){
        return this.withHandler(function(event){
          if (event.filter(f)) {
            return this.push(event);
          } else {
            return Bacon.more;
          }
        });
      });
    };
    prototype.takeWhile = function(f){
      var args;
      args = slice$.call(arguments, 1);
      return convertArgsToFunction(this, f, args, function(f){
        return this.withHandler(function(event){
          if (event.filter(f)) {
            return this.push(event);
          } else {
            this.push(end());
            return Bacon.noMore;
          }
        });
      });
    };
    prototype.endOnError = function(f){
      var args;
      args = slice$.call(arguments, 1);
      if (f == null) {
        f = true;
      }
      return convertArgsToFunction(this, f, args, function(f){
        return this.withHandler(function(event){
          if (event.isError() && f(event.error)) {
            this.push(event);
            return this.push(end());
          } else {
            return this.push(event);
          }
        });
      });
    };
    prototype.take = function(count){
      if (count <= 0) {
        return Bacon.never();
      }
      return this.withHandler(function(event){
        if (!event.hasValue()) {
          return this.push(event);
        } else {
          count--;
          if (count > 0) {
            return this.push(event);
          } else {
            if (count === 0) {
              this.push(event);
            }
            this.push(end());
            return Bacon.noMore;
          }
        }
      });
    };
    prototype.map = function(p){
      var args;
      args = slice$.call(arguments, 1);
      if (p instanceof Property) {
        return p.sampledBy(this, former);
      } else {
        return convertArgsToFunction(this, p, args, function(f){
          return this.withHandler(function(event){
            return this.push(event.fmap(f));
          });
        });
      }
    };
    prototype.mapError = function(){
      var f;
      f = makeFunctionArgs(arguments);
      return this.withHandler(function(event){
        if (event.isError()) {
          return this.push(next(f(event.error)));
        } else {
          return this.push(event);
        }
      });
    };
    prototype.mapEnd = function(){
      var f;
      f = makeFunctionArgs(arguments);
      return this.withHandler(function(event){
        if (event.isEnd()) {
          this.push(next(f(event)));
          this.push(end());
          return Bacon.noMore;
        } else {
          return this.push(event);
        }
      });
    };
    prototype.doAction = function(){
      var f;
      f = makeFunctionArgs(arguments);
      return this.withHandler(function(event){
        if (event.hasValue()) {
          f(event.value());
        }
        return this.push(event);
      });
    };
    prototype.skip = function(count){
      return this.withHandler(function(event){
        if (!event.hasValue()) {
          return this.push(event);
        } else if (count > 0) {
          count--;
          return Bacon.more;
        } else {
          return this.push(event);
        }
      });
    };
    prototype.skipDuplicates = function(isEqual){
      isEqual == null && (isEqual = function(a, b){
        return a === b;
      });
      return this.withStateMachine(None, function(prev, event){
        if (!event.hasValue()) {
          return [prev, [event]];
        } else if (event.isInitial() || prev === None || !isEqual(prev.get(), event.value())) {
          return [new Some(event.value()), [event]];
        } else {
          return [prev, []];
        }
      });
    };
    prototype.skipErrors = function(){
      return this.withHandler(function(event){
        if (event.isError()) {
          return Bacon.more;
        } else {
          return this.push(event);
        }
      });
    };
    prototype.withStateMachine = function(initState, f){
      var state;
      state = initState;
      return this.withHandler(function(event){
        var fromF, newState, outputs, state, reply, i$, len$, output;
        fromF = f(state, event);
        newState = fromF[0], outputs = fromF[1];
        state = newState;
        reply = Bacon.more;
        for (i$ = 0, len$ = outputs.length; i$ < len$; ++i$) {
          output = outputs[i$];
          reply = this.push(output);
          if (reply === Bacon.noMore) {
            return reply;
          }
        }
        return reply;
      });
    };
    prototype.scan = function(seed, f, lazyF){
      var f_, acc, subscribe, this$ = this;
      f_ = toCombinator(f);
      f = lazyF
        ? f_
        : function(x, y){
          return f_(x(), y());
        };
      acc = toOption(seed).map(function(x){
        return _.always(x);
      });
      subscribe = function(sink){
        var initSent, unsub, reply, sendInit;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function(){
          var initSent;
          if (!initSent) {
            initSent = true;
            return acc.forEach(function(valueF){
              var reply, unsub;
              reply = sink(new Initial(valueF));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = this$.subscribe(function(event){
          var initSent, prev, next, acc, reply;
          if (event.hasValue()) {
            if (initSent && event.isInitial()) {
              return Bacon.more;
            } else {
              if (!event.isInitial()) {
                sendInit();
              }
              initSent = true;
              prev = acc.getOrElse(function(){
                return undefined;
              });
              next = _.cached(function(){
                return f(prev, event.value);
              });
              acc = new Some(next);
              return sink(event.apply(next));
            }
          } else {
            if (event.isEnd()) {
              reply = sendInit();
            }
            if (reply !== Bacon.noMore) {
              return sink(event);
            }
          }
        });
        sendInit();
        return unsub;
      };
      return new Property(subscribe);
    };
    prototype.fold = function(seed, f){
      return this.scan(seed, f).sampledBy(this.filter(false).mapEnd().toProperty());
    };
    prototype.zip = function(other, f){
      f == null && (f = Array);
      return Bacon.zipWith([this, other], f);
    };
    prototype.diff = function(start, f){
      f = toCombinator(f);
      return this.scan([start], function(prevTuple, next){
        return [next, f(prevTuple[0], next)];
      }).filter(function(tuple){
        return tuple.length === 2;
      }).map(function(tuple){
        return tuple[1];
      });
    };
    prototype.flatMap = function(f, firstOnly){
      var root;
      f = makeSpawner(f);
      root = this;
      return new EventStream(function(sink){
        var composite, checkEnd;
        composite = new CompositeUnsubscribe();
        checkEnd = function(unsub){
          unsub();
          if (composite.empty()) {
            return sink(end());
          }
        };
        composite.add(function(__, unsubRoot){
          return root.subscribe(function(event){
            var child;
            if (event.isEnd()) {
              return checkEnd(unsubRoot);
            } else if (event.isError()) {
              return sink(event);
            } else if (firstOnly && composite.count() > 1) {
              return Bacon.more;
            } else {
              if (composite.unsubscribed) {
                return Bacon.noMore;
              }
              child = f(event.value());
              if (!(child instanceof Observable)) {
                child = Bacon.once(child);
              }
              return composite.add(function(unsubAll, unsubMe){
                return child.subscribe(function(event){
                  var reply;
                  if (event.isEnd()) {
                    checkEnd(unsubMe);
                    return Bacon.noMore;
                  } else {
                    if (event instanceof Initial) {
                      event = event.toNext();
                    }
                    reply = sink(event);
                    if (reply === Bacon.noMore) {
                      unsubAll();
                    }
                    return reply;
                  }
                });
              });
            }
          });
        });
        return composite.unsubscribe;
      });
    };
    prototype.flatMapFirst = function(f){
      return this.flatMap(f, true);
    };
    prototype.flatMapLatest = function(f){
      var stream, this$ = this;
      f = makeSpawner(f);
      stream = this.toEventStream();
      return stream.flatMap(function(value){
        return f(value).takeUntil(stream);
      });
    };
    prototype.not = function(){
      return this.map(function(x){
        return !x;
      });
    };
    prototype.log = function(){
      var args;
      args = slice$.call(arguments);
      this.subscribe(function(event){
        return typeof console != 'undefined' && console !== null ? typeof console.log === 'function' ? console.log.apply(null, slice$.call(args).concat([event.describe()])) : void 8 : void 8;
      });
      return this;
    };
    prototype.slidingWindow = function(n, minValues){
      minValues == null && (minValues = 0);
      return this.scan([], function(window, value){
        return window.concat([value]).slice(-n);
      }).filter(function(values){
        return values.length >= minValues;
      });
    };
    prototype.combine = function(other, f){
      var combinator;
      combinator = toCombinator(f);
      return Bacon.combineAsArray(this, other).map(function(values){
        return combinator(values[0], values[1]);
      });
    };
    prototype.decode = function(cases){
      return this.combine(Bacon.combineTemplate(cases), function(key, values){
        return values[key];
      });
    };
    prototype.awaiting = function(other){
      return this.toEventStream().map(true).merge(other.toEventStream().map(false)).toProperty(false);
    };
    return Observable;
  }());
  Observable(prototype(reduce = Observable(prototype(fold))));
  EventStream = (function(superclass){
    var prototype = extend$((import$(EventStream, superclass).displayName = 'EventStream', EventStream), superclass).prototype, constructor = EventStream;
    function EventStream(subscribe){
      var dispatcher;
      this.takeUntil = bind$(this, 'takeUntil', prototype);
      this.sampledBy = bind$(this, 'sampledBy', prototype);
      EventStream.superclass.call(this);
      assertFunction(subscribe);
      dispatcher = new Dispatcher(subscribe);
      this.subscribe = dispatcher.subscribe;
      this.subscribeInternal = this.subscribe;
      this.hasSubscribers = dispatcher.hasSubscribers;
    }
    prototype.delay = function(delay){
      return this.flatMap(function(value){
        return Bacon.later(delay, value);
      });
    };
    prototype.debounce = function(delay){
      return this.flatMapLatest(function(value){
        return Bacon.later(delay, value);
      });
    };
    prototype.debounceImmediate = function(delay){
      return this.flatMapFirst(function(value){
        return Bacon.once(value).concat(Bacon.later(delay).filter(false));
      });
    };
    prototype.throttle = function(delay){
      return this.bufferWithTime(delay).map(function(values){
        return values[values.length - 1];
      });
    };
    prototype.bufferWithTime = function(delay){
      return this.bufferWithTimeOrCount(delay, Number.MAX_VALUE);
    };
    prototype.bufferWithCount = function(count){
      return this.bufferWithTimeOrCount(undefined, count);
    };
    prototype.bufferWithTimeOrCount = function(delay, count){
      var flushOrSchedule;
      flushOrSchedule = function(buffer){
        if (buffer.values.length === count) {
          return buffer.flush();
        } else if (delay !== undefined) {
          return buffer.schedule();
        }
      };
      return this.buffer(delay, flushOrSchedule, flushOrSchedule);
    };
    prototype.buffer = function(delay, onInput, onFlush){
      var buffer, reply, delayMs;
      onInput == null && (onInput = function(){});
      onFlush == null && (onFlush = function(){});
      buffer = {
        scheduled: false,
        end: null,
        values: [],
        flush: function(){
          var reply;
          this.scheduled = false;
          if (this.values.length > 0) {
            reply = this.push(next(this.values));
            this.values = [];
            if (this.end != null) {
              return this.push(this.end);
            } else if (reply !== Bacon.noMore) {
              return onFlush(this);
            }
          } else {
            if (this.end != null) {
              return this.push(this.end);
            }
          }
        },
        schedule: function(){
          var this$ = this;
          if (!this.scheduled) {
            this.scheduled = true;
            return delay(function(){
              return this$.flush();
            });
          }
        }
      };
      reply = Bacon.more;
      if (!isFunction(delay)) {
        delayMs = delay;
        delay = function(f){
          return Bacon.scheduler.setTimeout(f, delayMs);
        };
      }
      return this.withHandler(function(event){
        var reply;
        buffer.push = this.push;
        if (event.isError()) {
          reply = this.push(event);
        } else if (event.isEnd()) {
          buffer.end = event;
          if (!buffer.scheduled) {
            buffer.flush();
          }
        } else {
          buffer.values.push(event.value());
          onInput(buffer);
        }
        return reply;
      });
    };
    prototype.merge = function(right){
      var left;
      assertEventStream(right);
      left = this;
      return new EventStream(function(sink){
        var ends, smartSink;
        ends = 0;
        smartSink = function(obs){
          return function(unsubBoth){
            return obs.subscribe(function(event){
              var reply;
              if (event.isEnd()) {
                ends++;
                if (ends === 2) {
                  return sink(end());
                } else {
                  return Bacon.more;
                }
              } else {
                reply = sink(event);
                if (reply === Bacon.noMore) {
                  unsubBoth();
                }
                return reply;
              }
            });
          };
        };
        return compositeUnsubscribe(smartSink(left), smartSink(right));
      });
    };
    prototype.toProperty = function(initValue){
      if (arguments.length === 0) {
        initValue = None;
      }
      return this.scan(initValue, latterF, true);
    };
    prototype.toEventStream = function(){
      return this;
    };
    prototype.sampledBy = function(sampler, combinator){
      return this.toProperty().sampledBy(sampler, combinator);
    };
    prototype.concat = function(right){
      var left;
      left = this;
      return new EventStream(function(sink){
        var unsubRight, unsubLeft;
        unsubRight = nop;
        unsubLeft = left.subscribe(function(e){
          var unsubRight;
          if (e.isEnd()) {
            return unsubRight = right.subscribe(sink);
          } else {
            return sink(e);
          }
        });
        return function(){
          unsubLeft();
          return unsubRight();
        };
      });
    };
    prototype.takeUntil = function(stopper){
      var self;
      self = this;
      return new EventStream(function(sink){
        var stop, produce;
        stop = function(unsubAll){
          return stopper.onValue(function(){
            sink(end());
            unsubAll();
            return Bacon.noMore;
          });
        };
        produce = function(unsubAll){
          return self.subscribe(function(x){
            var reply;
            reply = sink(x);
            if (x.isEnd() || reply === Bacon.noMore) {
              unsubAll();
            }
            return reply;
          });
        };
        return compositeUnsubscribe(stop, produce);
      });
    };
    prototype.skipUntil = function(starter){
      var started;
      started = starter.take(1).map(true).toProperty(false);
      return this.filter(started);
    };
    prototype.skipWhile = function(f){
      var args, ok;
      args = slice$.call(arguments, 1);
      ok = false;
      return convertArgsToFunction(this, f, args, function(f){
        return this.withHandler(function(event){
          var ok;
          if (ok || !event.hasValue() || !f(event.value())) {
            if (event.hasValue()) {
              ok = true;
            }
            return this.push(event);
          } else {
            return Bacon.more;
          }
        });
      });
    };
    prototype.startWith = function(seed){
      return Bacon.once(seed).concat(this);
    };
    prototype.withHandler = function(handler){
      var dispatcher;
      dispatcher = new Dispatcher(this.subscribe, handler);
      return new EventStream(dispatcher.subscribe);
    };
    prototype.withSubscribe = function(subscribe){
      return new EventStream(subscribe);
    };
    return EventStream;
  }(Observable));
  Property = (function(superclass){
    var prototype = extend$((import$(Property, superclass).displayName = 'Property', Property), superclass).prototype, constructor = Property;
    function Property(subscribe, handler){
      var this$ = this;
      this.toEventStream = bind$(this, 'toEventStream', prototype);
      this.toProperty = bind$(this, 'toProperty', prototype);
      this.changes = bind$(this, 'changes', prototype);
      this.sample = bind$(this, 'sample', prototype);
      Property.superclass.call(this);
      if (handler === true) {
        this.subscribeInternal = subscribe;
      } else {
        this.subscribeInternal = new PropertyDispatcher(subscribe, handler).subscribe;
      }
      this.sampledBy = function(sampler, combinator){
        var lazy, thisSource, samplerSource, stream;
        if (combinator != null) {
          combinator = toCombinator(combinator);
        } else {
          lazy = true;
          combinator = function(f){
            return f();
          };
        }
        thisSource = new Source(this$, false, false, this$.subscribeInternal, lazy);
        samplerSource = new Source(sampler, true, false, sampler.subscribe, lazy);
        stream = Bacon.when([thisSource, samplerSource], combinator);
        if (sampler instanceof Property) {
          return stream.toProperty();
        } else {
          return stream;
        }
      };
      this.subscribe = function(sink){
        var reply, LatestEvent, value, end, unsub;
        reply = Bacon.more;
        LatestEvent = (function(){
          LatestEvent.displayName = 'LatestEvent';
          var prototype = LatestEvent.prototype, constructor = LatestEvent;
          prototype.set = function(event){
            return this.event = event;
          };
          prototype.send = function(){
            var event, reply;
            event = this.event;
            this.event = null;
            if (event != null && reply !== Bacon.noMore) {
              reply = sink(event);
              if (reply === Bacon.noMore) {
                return unsub();
              }
            }
          };
          function LatestEvent(){}
          return LatestEvent;
        }());
        value = new LatestEvent();
        end = new LatestEvent();
        unsub = nop;
        unsub = this$.subscribeInternal(function(event){
          var reply;
          if (event.isError()) {
            if (reply !== Bacon.noMore) {
              reply = sink(event);
            }
          } else {
            if (event.hasValue()) {
              value.set(event);
            } else if (event.isEnd()) {
              end.set(event);
            }
            PropertyTransaction.onDone(function(){
              value.send();
              return end.send();
            });
          }
          return reply;
        });
        return function(){
          var reply;
          reply = Bacon.noMore;
          return unsub();
        };
      };
    }
    prototype.sample = function(interval){
      return this.sampledBy(Bacon.interval(interval, {}));
    };
    prototype.changes = function(){
      var this$ = this;
      return new EventStream(function(sink){
        return this$.subscribe(function(event){
          if (!event.isInitial()) {
            return sink(event);
          }
        });
      });
    };
    prototype.withHandler = function(handler){
      return new Property(this.subscribeInternal, handler);
    };
    prototype.withSubscribe = function(subscribe){
      return new Property(subscribe);
    };
    prototype.toProperty = function(){
      assertNoArguments(arguments);
      return this;
    };
    prototype.toEventStream = function(){
      var this$ = this;
      return new EventStream(function(sink){
        return this$.subscribe(function(event){
          if (event.isInitial()) {
            event = event.toNext();
          }
          return sink(event);
        });
      });
    };
    prototype.and = function(other){
      return this.combine(other, function(x, y){
        return x && y;
      });
    };
    prototype.or = function(other){
      return this.combine(other, function(x, y){
        return x || y;
      });
    };
    prototype.delay = function(delay){
      return this.delayChanges(function(changes){
        return changes.delay(delay);
      });
    };
    prototype.debounce = function(delay){
      return this.delayChanges(function(changes){
        return changes.debounce(delay);
      });
    };
    prototype.throttle = function(delay){
      return this.delayChanges(function(changes){
        return changes.throttle(delay);
      });
    };
    prototype.delayChanges = function(f){
      return addPropertyInitValueToStream(this, f(this.changes()));
    };
    prototype.takeUntil = function(stopper){
      var changes;
      changes = this.changes().takeUntil(stopper);
      return addPropertyInitValueToStream(this, changes);
    };
    prototype.startWith = function(value){
      return this.scan(value, function(prev, next){
        return next;
      });
    };
    return Property;
  }(Observable));
  convertArgsToFunction = function(obs, f, args, method){
    var sampled;
    if (f instanceof Property) {
      sampled = f.sampledBy(obs, function(p, s){
        return [p, s];
      });
      return method.apply(sampled, [function(arg$){
        var p, s;
        p = arg$[0], s = arg$[1];
        return p;
      }]).map(function(arg$){
        var p, s;
        p = arg$[0], s = arg$[1];
        return s;
      });
    } else {
      f = makeFunction(f, args);
      return method.apply(obs, [f]);
    }
  };
  addPropertyInitValueToStream = function(property, stream){
    var getInitValue;
    getInitValue = function(property){
      var value;
      value = None;
      property.subscribe(function(event){
        var value;
        if (event.hasValue()) {
          value = new Some(event.value());
        }
        return Bacon.noMore;
      });
      return value;
    };
    return stream.toProperty(getInitValue(property));
  };
  Dispatcher = (function(){
    Dispatcher.displayName = 'Dispatcher';
    var prototype = Dispatcher.prototype, constructor = Dispatcher;
    function Dispatcher(subscribe, handleEvent){
      var subscriptions, queue, pushing, ended, prevError, unsubscribeFromSource, removeSub, waiters, done, this$ = this;
      subscribe == null && (subscribe = function(){
        return nop;
      });
      subscriptions = [];
      queue = null;
      pushing = false;
      ended = false;
      this.hasSubscribers = function(){
        return subscriptions.length > 0;
      };
      prevError = null;
      unsubscribeFromSource = nop;
      removeSub = function(subscription){
        var subscriptions;
        return subscriptions = _.without(subscription, subscriptions);
      };
      waiters = null;
      done = function(){
        var ws, waiters, i$, len$, w, results$ = [];
        if (waiters != null) {
          ws = waiters;
          waiters = null;
          for (i$ = 0, len$ = ws.length; i$ < len$; ++i$) {
            w = ws[i$];
            results$.push(w());
          }
          return results$;
        }
      };
      this.push = function(event){
        var prevError, success, pushing, tmp, i$, len$, sub, reply, queue;
        if (!pushing) {
          if (event === prevError) {
            return;
          }
          if (event.isError()) {
            prevError = event;
          }
          success = false;
          try {
            pushing = true;
            tmp = subscriptions;
            for (i$ = 0, len$ = tmp.length; i$ < len$; ++i$) {
              sub = tmp[i$];
              reply = sub.sink(event);
              if (reply === Bacon.noMore || event.isEnd()) {
                removeSub(sub);
              }
            }
            success = true;
          } finally {
            pushing = false;
            if (!success) {
              queue = null;
            }
          }
          success = true;
          while (queue != null && queue.length) {
            event = _.head(queue);
            queue = _.tail(queue);
            this$.push(event);
          }
          done(event);
          if (this$.hasSubscribers()) {
            return Bacon.more;
          } else {
            return Bacon.noMore;
          }
        } else {
          queue = (queue || []).concat([event]);
          return Bacon.more;
        }
      };
      handleEvent == null && (handleEvent = function(event){
        return this.push(event);
      });
      this.handleEvent = function(event){
        var ended;
        if (event.isEnd()) {
          ended = true;
        }
        return handleEvent.apply(this$, [event]);
      };
      this.subscribe = function(sink){
        var subscription, subscriptions, unsubscribeFromSource;
        if (ended) {
          sink(end());
          return nop;
        } else {
          assertFunction(sink);
          subscription = {
            sink: sink
          };
          subscriptions = subscriptions.concat(subscription);
          if (subscriptions.length === 1) {
            unsubscribeFromSource = subscribe(this$.handleEvent);
          }
          assertFunction(unsubscribeFromSource);
          return function(){
            removeSub(subscription);
            if (!this$.hasSubscribers()) {
              return unsubscribeFromSource();
            }
          };
        }
      };
    }
    return Dispatcher;
  }());
  PropertyDispatcher = (function(superclass){
    var prototype = extend$((import$(PropertyDispatcher, superclass).displayName = 'PropertyDispatcher', PropertyDispatcher), superclass).prototype, constructor = PropertyDispatcher;
    function PropertyDispatcher(subscribe, handleEvent){
      var current, push, ended, this$ = this;
      PropertyDispatcher.superclass.call(this, subscribe, handleEvent);
      current = None;
      push = this.push;
      subscribe = this.subscribe;
      ended = false;
      this.push = function(event){
        var ended, current;
        if (event.isEnd()) {
          ended = true;
        }
        if (event.hasValue()) {
          current = new Some(event.value);
        }
        return PropertyTransaction.inTransaction(function(){
          return push.apply(this$, [event]);
        });
      };
      this.subscribe = function(sink){
        var initSent, shouldBounceInitialValue, reply;
        initSent = false;
        shouldBounceInitialValue = function(){
          return this$.hasSubscribers() || ended;
        };
        reply = current.filter(shouldBounceInitialValue).map(function(val){
          return sink(initial(val()));
        });
        if (reply.getOrElse(Bacon.more) === Bacon.noMore) {
          return nop;
        } else if (ended) {
          sink(end());
          return nop;
        } else {
          return subscribe.apply(this$, [sink]);
        }
      };
    }
    return PropertyDispatcher;
  }(Dispatcher));
  PropertyTransaction = function(){
    var txListeners, tx, onDone, inTransaction;
    txListeners = [];
    tx = false;
    onDone = function(f){
      if (tx) {
        return txListeners.push(f);
      } else {
        return f();
      }
    };
    inTransaction = function(f){
      var tx, result, gs, txListeners, i$, len$, g;
      if (tx) {
        return f();
      } else {
        tx = true;
        try {
          result = f();
        } finally {
          tx = false;
        }
        gs = txListeners;
        txListeners = [];
        for (i$ = 0, len$ = gs.length; i$ < len$; ++i$) {
          g = gs[i$];
          g();
        }
        return result;
      }
    };
    return {
      onDone: onDone,
      inTransaction: inTransaction
    };
  }();
  Bus = (function(superclass){
    var prototype = extend$((import$(Bus, superclass).displayName = 'Bus', Bus), superclass).prototype, constructor = Bus;
    function Bus(){
      var sink, subscriptions, ended, guardedSink, unsubAll, subscribeInput, unsubscribeInput, subscribeAll, this$ = this;
      sink = undefined;
      subscriptions = [];
      ended = false;
      guardedSink = function(input){
        return function(event){
          if (event.isEnd()) {
            unsubscribeInput(input);
            return Bacon.noMore;
          } else {
            return sink(event);
          }
        };
      };
      unsubAll = function(){
        var i$, ref$, len$, sub, results$ = [];
        for (i$ = 0, len$ = (ref$ = subscriptions).length; i$ < len$; ++i$) {
          sub = ref$[i$];
          results$.push(typeof sub.unsub === 'function' ? sub.unsub() : void 8);
        }
        return results$;
      };
      subscribeInput = function(subscription){
        return subscription.unsub = subscription.input.subscribe(guardedSink(subscription.input));
      };
      unsubscribeInput = function(input){
        var i$, ref$, len$, i, sub;
        for (i$ = 0, len$ = (ref$ = subscriptions).length; i$ < len$; ++i$) {
          i = i$;
          sub = ref$[i$];
          if (sub.input === input) {
            if (typeof sub.unsub === 'function') {
              sub.unsub();
            }
            subscriptions.splice(i, 1);
            return;
          }
        }
      };
      subscribeAll = function(newSink){
        var sink, i$, ref$, len$, subscription;
        sink = newSink;
        for (i$ = 0, len$ = (ref$ = cloneArray(subscriptions)).length; i$ < len$; ++i$) {
          subscription = ref$[i$];
          subscribeInput(subscription);
        }
        return unsubAll;
      };
      Bus.superclass.call(this, subscribeAll);
      this.plug = function(input){
        var sub;
        if (ended) {
          return;
        }
        sub = {
          input: input
        };
        subscriptions.push(sub);
        if (sink != null) {
          subscribeInput(sub);
        }
        return function(){
          return unsubscribeInput(input);
        };
      };
      this.push = function(value){
        return typeof sink === 'function' ? sink(next(value)) : void 8;
      };
      this.error = function(error){
        return typeof sink === 'function' ? sink(new Error(error)) : void 8;
      };
      this.end = function(){
        var ended;
        ended = true;
        unsubAll();
        return typeof sink === 'function' ? sink(end()) : void 8;
      };
    }
    return Bus;
  }(EventStream));
  Source = (function(){
    Source.displayName = 'Source';
    var prototype = Source.prototype, constructor = Source;
    function Source(s, sync, consume, subscribe, lazy){
      var queue, invoke;
      this.sync = sync;
      this.subscribe = subscribe;
      lazy == null && (lazy = false);
      queue = [];
      invoke = lazy
        ? _.id
        : function(f){
          return f();
        };
      if (this.subscribe == null) {
        this.subscribe = s.subscribe;
      }
      this.markEnded = function(){
        return this.ended = true;
      };
      if (consume) {
        this.consume = function(){
          return invoke(queue.shift());
        };
        this.push = function(x){
          return queue.push(x);
        };
        this.mayHave = function(c){
          return !this.ended || queue.length >= c;
        };
        this.hasAtLeast = function(c){
          return queue.length >= c;
        };
      } else {
        this.consume = function(){
          return invoke(queue[0]);
        };
        this.push = function(x){
          var queue;
          return queue = [x];
        };
        this.mayHave = function(){
          return true;
        };
        this.hasAtLeast = function(){
          return queue.length;
        };
      }
    }
    return Source;
  }());
  Source.fromObservable = function(s){
    if (s instanceof Source) {
      return s;
    } else if (s instanceof Property) {
      return new Source(s, false, false);
    } else {
      return new Source(s, true, true);
    }
  };
  Bacon.when = function(){
    var patterns, len, usage, sources, pats, i, patSources, f, pat, i$, len$, s, index, j$, ref$, len1$, ix;
    patterns = slice$.call(arguments);
    if (patterns.length === 0) {
      return Bacon.never();
    }
    len = patterns.length;
    usage = "when: expecting arguments in the form (Observable+,function)+";
    assert(usage, len % 2 === 0);
    sources = [];
    pats = [];
    i = 0;
    while (i < len) {
      patSources = _.toArray(patterns[i]);
      f = patterns[i + 1];
      pat = {
        f: isFunction(f)
          ? f
          : fn$,
        ixs: []
      };
      for (i$ = 0, len$ = patSources.length; i$ < len$; ++i$) {
        s = patSources[i$];
        assert(s instanceof Observable, usage);
        index = indexOf(sources, s);
        if (index < 0) {
          sources.push(s);
          index = sources.length - 1;
        }
        for (j$ = 0, len1$ = (ref$ = pat.ixs).length; j$ < len1$; ++j$) {
          ix = ref$[j$];
          if (ix.index === index) {
            ix.count++;
          }
        }
        pat.ixs.push({
          index: index,
          count: 1
        });
      }
      if (patSources.length > 0) {
        pats.push(pat);
      }
      i = i + 2;
    }
    if (!sources.length) {
      return Bacon.never();
    }
    sources = _.map(Source.fromObservable, sources);
    return new EventStream(function(sink){
      var fMatch, cannotSync, cannotMatch, part, i, s;
      fMatch = function(p){
        return _.all(p.ixs, function(i){
          return sources[i.index].hasAtLeast(i.count);
        });
      };
      cannotSync = function(source){
        return !source.sync || source.ended;
      };
      cannotMatch = function(p){
        return _.any(p.ixs, function(i){
          return !sources[i.index].mayHave(i.count);
        });
      };
      part = function(source){
        return function(unsubAll){
          return source.subscribe(function(e){
            var reply, i$, ref$, len$, p, val;
            if (e.isEnd()) {
              source.markEnded();
              if (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
                reply = Bacon.noMore;
                sink(end());
              }
            } else if (e.isError()) {
              reply = sink(e);
            } else {
              source.push(e.value);
              if (source.sync) {
                for (i$ = 0, len$ = (ref$ = pats).length; i$ < len$; ++i$) {
                  p = ref$[i$];
                  if (fMatch(p)) {
                    val = fn$;
                    reply = sink(e.apply(val));
                    break;
                  }
                }
              }
            }
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply || Bacon.more;
            function fn$(){
              var i;
              return p.f.apply(p, (function(){
                var i$, ref$, len$, results$ = [];
                for (i$ = 0, len$ = (ref$ = p.ixs).length; i$ < len$; ++i$) {
                  i = ref$[i$];
                  results$.push(sources[i.index].consume());
                }
                return results$;
              }()));
            }
          });
        };
      };
      return compositeUnsubscribe.apply(null, (function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = sources).length; i$ < len$; ++i$) {
          i = i$;
          s = ref$[i$];
          results$.push(part(s, i));
        }
        return results$;
      }()));
    });
    function fn$(){
      return f;
    }
  };
  Bacon.update = function(initial){
    var patterns, lateBindFirst, i;
    patterns = slice$.call(arguments, 1);
    lateBindFirst = function(f){
      return function(){
        var args;
        args = slice$.call(arguments);
        return function(i){
          return f.apply(null, [i].concat(args));
        };
      };
    };
    i = patterns.length - 1;
    while (i > 0) {
      if (!(patterns[i] instanceof Function)) {
        patterns[i] = fn$();
      }
      patterns[i] = lateBindFirst(patterns[i]);
      i = i - 2;
    }
    return Bacon.when.apply(Bacon, patterns).scan(initial, function(x, f){
      return f(x);
    });
    function fn$(x){
      x == null && (x = patterns[i]);
      return function(){
        return x;
      };
    }
  };
  compositeUnsubscribe = function(){
    var ss;
    ss = slice$.call(arguments);
    return new CompositeUnsubscribe(ss).unsubscribe;
  };
  CompositeUnsubscribe = (function(){
    CompositeUnsubscribe.displayName = 'CompositeUnsubscribe';
    var prototype = CompositeUnsubscribe.prototype, constructor = CompositeUnsubscribe;
    function CompositeUnsubscribe(ss){
      var i$, len$, s;
      ss == null && (ss = []);
      this.empty = bind$(this, 'empty', prototype);
      this.count = bind$(this, 'count', prototype);
      this.unsubscribe = bind$(this, 'unsubscribe', prototype);
      this.add = bind$(this, 'add', prototype);
      this.unsubscribed = false;
      this.subscriptions = [];
      this.starting = [];
      for (i$ = 0, len$ = ss.length; i$ < len$; ++i$) {
        s = ss[i$];
        this.add(s);
      }
    }
    prototype.add = function(subscription){
      var ended, unsub, unsubMe, this$ = this;
      if (this.unsubscribed) {
        return;
      }
      ended = false;
      unsub = nop;
      this.starting.push(subscription);
      unsubMe = function(){
        var ended;
        if (this$.unsubscribed) {
          return;
        }
        ended = true;
        this$.remove(unsub);
        return _.remove(subscription, this$.starting);
      };
      unsub = subscription(this.unsubscribe, unsubMe);
      if (!(this.unsubscribed || ended)) {
        this.subscriptions.push(unsub);
      }
      _.remove(subscription, this.starting);
      return unsub;
    };
    prototype.remove = function(unsub){
      if (this.unsubscribed) {
        return;
      }
      if (_.remove(unsub, this.subscriptions) !== undefined) {
        return unsub();
      }
    };
    prototype.unsubscribe = function(){
      var i$, ref$, len$, s;
      if (this.unsubscribed) {
        return;
      }
      this.unsubscribed = true;
      for (i$ = 0, len$ = (ref$ = this.subscriptions).length; i$ < len$; ++i$) {
        s = ref$[i$];
        s();
      }
      this.subscriptions = [];
      return this.starting = [];
    };
    prototype.count = function(){
      if (this.unsubscribed) {
        return 0;
      }
      return this.subscriptions.length + this.starting.length;
    };
    prototype.empty = function(){
      return this.count() === 0;
    };
    return CompositeUnsubscribe;
  }());
  Bacon.CompositeUnsubscribe = CompositeUnsubscribe;
  Some = (function(){
    Some.displayName = 'Some';
    var prototype = Some.prototype, constructor = Some;
    function Some(value){
      this.value = value;
    }
    prototype.getOrElse = function(){
      return this.value;
    };
    prototype.get = function(){
      return this.value;
    };
    prototype.filter = function(f){
      if (f(this.value)) {
        return new Some(this.value);
      } else {
        return None;
      }
    };
    prototype.map = function(f){
      return new Some(f(this.value));
    };
    prototype.forEach = function(f){
      return f(this.value);
    };
    prototype.isDefined = true;
    prototype.toArray = function(){
      return [this.value];
    };
    return Some;
  }());
  None = {
    getOrElse: function(value){
      return value;
    },
    filter: function(){
      return None;
    },
    map: function(){
      return None;
    },
    forEach: function(){},
    isDefined: false,
    toArray: function(){
      return [];
    }
  };
  Bacon.EventStream = EventStream;
  Bacon.Property = Property;
  Bacon.Observable = Observable;
  Bacon.Bus = Bus;
  Bacon.Initial = Initial;
  Bacon.Next = Next;
  Bacon.End = End;
  Bacon.Error = Error;
  nop = function(){};
  latterF = function(_, x){
    return x();
  };
  former = function(x, _){
    return x;
  };
  initial = function(value){
    return new Initial(_.always(value));
  };
  next = function(value){
    return new Next(_.always(value));
  };
  end = function(){
    return new End();
  };
  toEvent = function(x){
    if (x instanceof Event) {
      return x;
    } else {
      return next(x);
    }
  };
  cloneArray = function(xs){
    return xs.slice(0);
  };
  indexOf = Array.prototype.indexOf
    ? function(xs, x){
      return xs.indexOf(x);
    }
    : function(xs, x){
      var i$, len$, i, y;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        i = i$;
        y = xs[i$];
        if (x === y) {
          return i;
        }
      }
      return -1;
    };
  assert = function(message, condition){
    if (!condition) {
      throw message;
    }
  };
  assertEvent = function(event){
    return assert("not an event : " + event, event instanceof Event) && event.isEvent();
  };
  assertEventStream = function(event){
    return assert("not an EventStream : " + event, event instanceof EventStream);
  };
  assertFunction = function(f){
    return assert("not a function : " + f, isFunction(f));
  };
  isFunction = function(f){
    return typeof f === "function";
  };
  assertArray = function(xs){
    return assert("not an array : " + xs, xs instanceof Array);
  };
  assertNoArguments = function(args){
    return assert("no arguments supported", args.length === 0);
  };
  assertString = function(x){
    return assert("not a string : " + x, typeof x === "string");
  };
  partiallyApplied = function(f, applied){
    return function(){
      var args;
      args = slice$.call(arguments);
      return f.apply(null, applied.concat(args));
    };
  };
  makeSpawner = function(f){
    if (f instanceof Observable) {
      f = _.always(f);
    }
    assertFunction(f);
    return f;
  };
  makeFunctionArgs = function(args){
    args = Array.prototype.slice.call(args);
    return makeFunction_.apply(null, args);
  };
  makeFunction_ = withMethodCallSupport(function(f){
    var args;
    args = slice$.call(arguments, 1);
    if (isFunction(f)) {
      if (args.length) {
        return partiallyApplied(f, args);
      } else {
        return f;
      }
    } else if (isFieldKey(f)) {
      return toFieldExtractor(f, args);
    } else {
      return _.always(f);
    }
  });
  makeFunction = function(f, args){
    return makeFunction_.apply(null, [f].concat(slice$.call(args)));
  };
  isFieldKey = function(f){
    return typeof f === "string" && f.length > 1 && f.charAt(0) === ".";
  };
  Bacon.isFieldKey = isFieldKey;
  toFieldExtractor = function(f, args){
    var parts, partFuncs;
    parts = f.slice(1).split(".");
    partFuncs = _.map(toSimpleExtractor(args), parts);
    return function(value){
      var i$, ref$, len$, f;
      for (i$ = 0, len$ = (ref$ = partFuncs).length; i$ < len$; ++i$) {
        f = ref$[i$];
        value = f(value);
      }
      return value;
    };
  };
  toSimpleExtractor = function(args){
    return function(key){
      return function(value){
        var fieldValue;
        if (value == null) {
          return undefined;
        } else {
          fieldValue = value[key];
          if (isFunction(fieldValue)) {
            return fieldValue.apply(value, args);
          } else {
            return fieldValue;
          }
        }
      };
    };
  };
  toFieldKey = function(f){
    return f.slice(1);
  };
  toCombinator = function(f){
    var key;
    if (isFunction(f)) {
      return f;
    } else if (isFieldKey(f)) {
      key = toFieldKey(f);
      return function(left, right){
        return left[key](right);
      };
    } else {
      return assert("not a function or a field key: " + f, false);
    }
  };
  toOption = function(v){
    if (v instanceof Some || v === None) {
      return v;
    } else {
      return new Some(v);
    }
  };
  _ = {
    head: function(xs){
      return xs[0];
    },
    always: function(x){
      return function(){
        return x;
      };
    },
    negate: function(f){
      return function(x){
        return !f(x);
      };
    },
    empty: function(xs){
      return xs.length === 0;
    },
    tail: function(xs){
      return slice$.call(xs, 1, xs.length);
    },
    filter: function(f, xs){
      var filtered, i$, len$, x;
      filtered = [];
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (f(x)) {
          filtered.push(x);
        }
      }
      return filtered;
    },
    map: function(f, xs){
      var i$, len$, x, results$ = [];
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        results$.push(f(x));
      }
      return results$;
    },
    each: function(xs, f){
      var key, value, results$ = [];
      for (key in xs) {
        value = xs[key];
        results$.push(f(key, value));
      }
      return results$;
    },
    toArray: function(xs){
      if (xs instanceof Array) {
        return xs;
      } else {
        return [xs];
      }
    },
    contains: function(xs, x){
      return indexOf(xs, x) !== -1;
    },
    id: function(x){
      return x;
    },
    last: function(xs){
      return xs[xs.length - 1];
    },
    all: function(xs, f){
      var i$, len$, x;
      f == null && (f = _.id);
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (!f(x)) {
          return false;
        }
      }
      return true;
    },
    any: function(xs, f){
      var i$, len$, x;
      f == null && (f = _.id);
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (f(x)) {
          return true;
        }
      }
      return false;
    },
    without: function(x, xs){
      return _.filter(function(y){
        return y !== x;
      }, xs);
    },
    remove: function(x, xs){
      var i;
      i = indexOf(xs, x);
      if (i >= 0) {
        return xs.splice(i, 1);
      }
    },
    fold: function(xs, seed, f){
      var i$, len$, x;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        seed = f(seed, x);
      }
      return seed;
    },
    cached: function(f){
      var value;
      value = None;
      return function(){
        var value, f;
        if (value === None) {
          value = f();
          f = null;
        }
        return value;
      };
    }
  };
  Bacon._ = _;
  Bacon.scheduler = {
    setTimeout: function(f, d){
      return setTimeout(f, d);
    },
    setInterval: function(f, i){
      return setInterval(f, i);
    },
    clearInterval: function(id){
      return clearInterval(id);
    },
    now: function(){
      return new Date().getTime();
    }
  };
  if (typeof module != 'undefined' && module !== null) {
    module.exports = Bacon;
    Bacon.Bacon = Bacon;
  } else {
    if ((typeof define != 'undefined' && define !== null) && define.amd != null) {
      define([], function(){
        return Bacon;
      });
    }
    this.Bacon = Bacon;
  }
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
