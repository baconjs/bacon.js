// build-dependencies: frombinder, _, event
Bacon.repeat = function(generator) {
  var index = 0;
  return Bacon.fromBinder(function(sink) {
    var flag = false;
    var reply = Bacon.more;
    var unsub = function() {};
    function handleEvent(event) {
      if (event.isEnd()) {
        if (!flag) {
          return flag = true;
        } else {
          return subscribeNext();
        }
      } else {
        return reply = sink(event);
      }
    };
    function subscribeNext() {
      var next;
      flag = true;
      while (flag && reply !== Bacon.noMore) {
        next = generator(index++);
        flag = false;
        if (next) {
          unsub = next.subscribeInternal(handleEvent);
        } else {
          sink(endEvent());
        }
      }
      return flag = true;
    };
    subscribeNext();
    return () => unsub();
  });
};
