// build-dependencies: eventstream, helpers

Bacon.EventStream.prototype.skipWhile = function(f, ...args) {
  assertObservableIsProperty(f);
  var ok = false;
  return convertArgsToFunction(this, f, args, function(f) {
    return withDesc(new Bacon.Desc(this, "skipWhile", [f]), this.withHandler(function(event) {
      if (ok || !event.hasValue() || !f(event.value)) {
        if (event.hasValue()) {
          ok = true;
        }
        return this.push(event);
      } else {
        return Bacon.more;
      }
    }));
  });
};
