// build-dependencies: core, eventstream, once
// build-dependencies: functionconstruction
// build-dependencies: compositeunsubscribe

Bacon.Observable.prototype.flatMap_ = function(f, params = { }) {
    const root = this
    const rootDep = [root];
    const childDeps = [];
    
    var result = new EventStream(params.desc || new Bacon.Desc(this, "flatMap_", arguments), function(sink) {
      var composite = new CompositeUnsubscribe();
      var queue = [];
      var spawn = function(event) {
        var child = makeObservable(f(event));
        childDeps.push(child);
        return composite.add(function(unsubAll, unsubMe) {
          return child.dispatcher.subscribe(function(event) {
            if (event.isEnd()) {
              _.remove(child, childDeps);
              checkQueue();
              checkEnd(unsubMe);
              return Bacon.noMore;
            } else {
              if ((typeof event !== "undefined" && event !== null) ? event._isInitial : undefined) {
                // To support Property as the spawned stream
                event = event.toNext();
              }
              var reply = sink(event);
              if (reply === Bacon.noMore) { unsubAll(); }
              return reply;
            }
          });
        });
      };
      var checkQueue = function() {
        var event = queue.shift();
        if (event) { return spawn(event); }
      };
      var checkEnd = function(unsub) {
        unsub();
        if (composite.empty()) { return sink(endEvent()); }
      };
      composite.add(function(__, unsubRoot) { return root.dispatcher.subscribe(function(event) {
        if (event.isEnd()) {
          return checkEnd(unsubRoot);
        } else if (event.isError() && !params.mapError) {
          return sink(event);
        } else if (params.firstOnly && composite.count() > 1) {
          return Bacon.more;
        } else {
          if (composite.unsubscribed) { return Bacon.noMore; }
          if (params.limit && composite.count() > params.limit) {
            return queue.push(event);
          } else {
            return spawn(event);
          }
        }
      });
      });
      return composite.unsubscribe;
    });
    result.internalDeps = function() {
      if (childDeps.length) {
        return rootDep.concat(childDeps);
      } else {
        return rootDep;
      }
    };
    return result;
  };
  
  const handleEventValueWith = f => event => f(event.value())

  var makeSpawner = function(args) {
    if (args.length === 1 && isObservable(args[0])) {
      return _.always(args[0]);
    } else {
      return makeFunctionArgs(args);
    }
  };
  
  var makeObservable = function(x) {
    if (isObservable(x)) {
      return x;
    } else {
      return Bacon.once(x);
    }
  };