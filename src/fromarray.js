// build-dependencies: eventstream, event, updatebarrier

Bacon.fromArray = function(values) {
  assertArray(values);
  if (!values.length) {
    return withDesc(new Bacon.Desc(Bacon, "fromArray", values), Bacon.never());
  } else {
    var i = 0;
    var stream = new EventStream(new Bacon.Desc(Bacon, "fromArray", [values]), function(sink) {
      var unsubd = false;
      var reply = Bacon.more;
      var pushing = false;
      var pushNeeded = false;
      function push() {
        pushNeeded = true;
        if (pushing) {
          return;
        }
        pushing = true;
        while (pushNeeded) {
          pushNeeded = false;
          if ((reply !== Bacon.noMore) && !unsubd) {
            var value = values[i++];
            reply = sink(toEvent(value));
            if (reply !== Bacon.noMore) {
              if (i === values.length) {
                sink(endEvent());
              } else {
                UpdateBarrier.afterTransaction(stream, push);
              }
            }
          }
        }
        pushing = false
        return pushing;
      };

      UpdateBarrier.soonButNotYet(stream, push)

      return function() {
        unsubd = true;
        return unsubd;
      };
    });
    return stream;
  }
};
