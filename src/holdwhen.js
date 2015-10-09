// build-dependencies: fromarray
// build-dependencies: when
// build-dependencies: once

Bacon.EventStream.prototype.holdWhen = function(valve) {
  var onHold = false;
  var bufferedValues = [];
  var src = this;
  return new EventStream(new Bacon.Desc(this, "holdWhen", [valve]), function(sink) {
    var composite = new CompositeUnsubscribe();
    var subscribed = false;
    var endIfBothEnded = function(unsub) {
      if (typeof unsub === "function") { unsub(); }
      if (composite.empty() && subscribed) {
        return sink(endEvent());
      }
    };
    composite.add(function(unsubAll, unsubMe) {
      return valve.subscribeInternal(function(event) {
        if (event.hasValue()) {
          onHold = event.value();
          if (!onHold) {
            var toSend = bufferedValues;
            bufferedValues = [];
            return (() => {
              var result = [];
              for (var i = 0, value; i < toSend.length; i++) {
                value = toSend[i];
                result.push(sink(nextEvent(value)));
              }
              return result;
            })();
          }
        } else if (event.isEnd()) {
          return endIfBothEnded(unsubMe);
        } else {
          return sink(event);
        }
      });
    });
    composite.add(function(unsubAll, unsubMe) {
      return src.subscribeInternal(function(event) {
        if (onHold && event.hasValue()) {
          return bufferedValues.push(event.value());
        } else if (event.isEnd() && bufferedValues.length) {
          return endIfBothEnded(unsubMe);
        } else {
          return sink(event);
        }
      });
    });
    subscribed = true;
    endIfBothEnded();
    return composite.unsubscribe;
  });
};
