// build-dependencies: core, source
// build-dependencies: functionconstruction
// build-dependencies: when, map

Bacon.EventStream.prototype.sampledBy = function(sampler, combinator) {
  return withDesc(
    new Bacon.Desc(this, "sampledBy", [sampler, combinator]),
    this.toProperty().sampledBy(sampler, combinator));
};

Bacon.Property.prototype.sampledBy = function(sampler, combinator) {
  var lazy = false;
  if ((typeof combinator !== "undefined" && combinator !== null)) {
    combinator = toCombinator(combinator);
  } else {
    lazy = true;
    combinator = function(f) { return f.value; };
  }
  var thisSource = new Source(this, false, lazy);
  var samplerSource = new Source(sampler, true, lazy);
  var stream = Bacon.when([thisSource, samplerSource], combinator);
  var result = sampler._isProperty ? stream.toProperty() : stream;
  return withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), result);
};

Bacon.Property.prototype.sample = function(interval) {
  return withDesc(
    new Bacon.Desc(this, "sample", [interval]),
    this.sampledBy(Bacon.interval(interval, {})));
};

Bacon.Observable.prototype.map = function(p, ...args) {
  if (p && p._isProperty) {
    return p.sampledBy(this, former);
  } else {
    return convertArgsToFunction(this, p, args, function(f) {
      return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
        return this.push(event.fmap(f));
      }));
    });
  }
};
